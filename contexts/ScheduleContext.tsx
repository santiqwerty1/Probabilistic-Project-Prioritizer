
import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { WeeklySchedule, MasterProject, ScheduledProject, Day, Hour, DayTemplate } from '../types';
import { mockMasterProjects, mockSchedule, mockTemplates } from '../mockData';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../constants';

interface ScheduleContextType {
  schedule: WeeklySchedule;
  setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
  masterProjects: MasterProject[];
  addMasterProject: (project: MasterProject) => void;
  updateMasterProject: (project: MasterProject) => void;
  deleteMasterProject: (projectId: string) => void;
  templates: DayTemplate[];
  addTemplate: (template: DayTemplate) => void;
  updateTemplate: (template: DayTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  applyTemplate: (templateId: string, days: Day[]) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

interface ScheduleProviderProps {
  children: ReactNode;
  useMockData: boolean;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children, useMockData }) => {
  const [schedule, setSchedule] = usePersistentState<WeeklySchedule>('schedule', {});
  const [masterProjects, setMasterProjects] = usePersistentState<MasterProject[]>('masterProjects', []);
  const [templates, setTemplates] = usePersistentState<DayTemplate[]>('templates', []);
  
  const addMasterProject = useCallback((project: MasterProject) => {
    if (useMockData) return;
    setMasterProjects(prev => [...prev, project]);
  }, [useMockData, setMasterProjects]);

  const updateMasterProject = useCallback((updatedProject: MasterProject) => {
    if (useMockData) return;
    setMasterProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSchedule(prevSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
        for (const day in newSchedule) {
            for (const hour in newSchedule[day as Day]) {
                const typedHour = hour as unknown as Hour;
                if (newSchedule[day as Day]![typedHour]) {
                      newSchedule[day as Day]![typedHour] = newSchedule[day as Day]![typedHour]!.map((p: ScheduledProject) => {
                        if (p.masterId === updatedProject.id) {
                            return { ...p, name: updatedProject.name, color: updatedProject.color };
                        }
                        return p;
                    });
                }
            }
        }
        return newSchedule;
    });
  }, [useMockData, setMasterProjects, setSchedule]);

  const deleteMasterProject = useCallback((projectId: string) => {
    if (useMockData) return;
    setMasterProjects(prev => prev.filter(p => p.id !== projectId));
    setSchedule(prevSchedule => {
        const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
        for (const day of DAYS_OF_WEEK) {
            if (newSchedule[day]) {
                for (const hour of HOURS_OF_DAY) {
                    if (newSchedule[day][hour]) {
                        newSchedule[day][hour] = newSchedule[day][hour]!.filter((p: ScheduledProject) => p.masterId !== projectId);
                        if (newSchedule[day][hour]!.length === 0) {
                            delete newSchedule[day][hour];
                        }
                    }
                }
                if (Object.keys(newSchedule[day]).length === 0) {
                    delete newSchedule[day];
                }
            }
        }
        return newSchedule;
    });
  }, [useMockData, setMasterProjects, setSchedule]);

  const addTemplate = useCallback((template: DayTemplate) => {
    if (useMockData) return;
    setTemplates(prev => [...prev, template]);
  }, [useMockData, setTemplates]);

  const updateTemplate = useCallback((updatedTemplate: DayTemplate) => {
    if (useMockData) return;
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  }, [useMockData, setTemplates]);

  const deleteTemplate = useCallback((templateId: string) => {
    if (useMockData) return;
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [useMockData, setTemplates]);
  
  const applyTemplate = useCallback((templateId: string, days: Day[]) => {
    if (useMockData) return;
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setSchedule(prevSchedule => {
        const newSchedule = { ...prevSchedule };
        for (const day of days) {
            // Clear the existing day's schedule first
            newSchedule[day] = {};
            // Apply the template schedule
            for (const hourStr in template.schedule) {
                const hour = parseInt(hourStr) as Hour;
                const templateProjects = template.schedule[hour];
                if (templateProjects) {
                    // Create new unique IDs for the scheduled projects
                    if (!newSchedule[day]) newSchedule[day] = {};
                    newSchedule[day]![hour] = templateProjects.map(p => ({
                        ...p,
                        id: `${p.masterId}-${day}-${hour}-${Math.random()}`
                    }));
                }
            }
        }
        return newSchedule;
    });
  }, [useMockData, templates, setSchedule]);

  const value = useMemo(() => ({
    schedule,
    setSchedule,
    masterProjects,
    addMasterProject,
    updateMasterProject,
    deleteMasterProject,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
  }), [
      schedule, setSchedule, masterProjects, addMasterProject, updateMasterProject, 
      deleteMasterProject, templates, addTemplate, updateTemplate, deleteTemplate, applyTemplate
  ]);

  const mockValue: ScheduleContextType = {
      schedule: mockSchedule,
      setSchedule: () => {},
      masterProjects: mockMasterProjects,
      addMasterProject: () => {},
      updateMasterProject: () => {},
      deleteMasterProject: () => {},
      templates: mockTemplates,
      addTemplate: () => {},
      updateTemplate: () => {},
      deleteTemplate: () => {},
      applyTemplate: () => {},
  };

  return (
    <ScheduleContext.Provider value={useMockData ? mockValue : value}>
      {children}
    </ScheduleContext.Provider>
  );
};
