import React, { useState, useMemo } from 'react';
import { Day, Hour, WeeklySchedule, ScheduledProject, MasterProject } from '../types';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../constants';
import { CalendarDaysIcon, ListBulletIcon, PencilIcon, XMarkIcon, ArrowUturnLeftIcon } from './Icons';
import Modal from './Modal';
import ProjectForm from './ProjectForm';
import ProjectsView from './ProjectsView';
import ProjectScheduleEditor from './ProjectScheduleEditor';
import TimeSlotCell from './TimeSlotCell';
import ConfirmationModal from './ConfirmationModal';

interface ConfigurationViewProps {
    schedule: WeeklySchedule;
    setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
    masterProjects: MasterProject[];
    setMasterProjects: React.Dispatch<React.SetStateAction<MasterProject[]>>;
    onBackToDashboard: () => void;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({
    schedule,
    setSchedule,
    masterProjects,
    setMasterProjects,
    onBackToDashboard
}) => {
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [projectToSchedule, setProjectToSchedule] = useState<MasterProject | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ day: Day; hour: Hour } | null>(null);
    const [editingProject, setEditingProject] = useState<ScheduledProject | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'schedule' | 'projects'>('schedule');
    const [confirmation, setConfirmation] = useState<{
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const handleAddProjectClick = (day: Day, hour: Hour) => {
        setSelectedSlot({ day, hour });
        setEditingProject(null);
        setIsSlotModalOpen(true);
    };

    const handleEditProjectClick = (project: ScheduledProject, day: Day, hour: Hour) => {
        setSelectedSlot({ day, hour });
        setEditingProject(project);
        setIsSlotModalOpen(true);
    }

    const handleSaveScheduledProject = (project: ScheduledProject) => {
        if (!selectedSlot) return;
        const { day, hour } = selectedSlot;

        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            if (!newSchedule[day]) newSchedule[day] = {};
            if (!newSchedule[day][hour]) newSchedule[day][hour] = [];

            const projects = [...(newSchedule[day][hour] || [])];
            const existingIndex = projects.findIndex(p => p.id === project.id);

            if (existingIndex > -1) {
                projects[existingIndex] = project;
            } else {
                projects.push(project);
            }

            newSchedule[day][hour] = projects;
            return newSchedule;
        });

        setIsSlotModalOpen(false);
        setEditingProject(null);
    };

    const handleDeleteScheduledProject = (projectId: string) => {
        if (!selectedSlot) return;
        const { day, hour } = selectedSlot;

        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            if (!newSchedule[day] || !newSchedule[day][hour]) return newSchedule;

            newSchedule[day][hour] = newSchedule[day][hour]?.filter(p => p.id !== projectId);
            return newSchedule;
        });

        setIsSlotModalOpen(false);
        setEditingProject(null);
    }

    const handleSaveProjectSchedule = (
        updatedProject: MasterProject,
        scheduleMap: { [key: string]: number }
    ) => {
        handleUpdateMasterProject(updatedProject);

        const newSchedule = JSON.parse(JSON.stringify(schedule));

        for (const day of DAYS_OF_WEEK) {
            if (newSchedule[day]) {
                for (const hour of HOURS_OF_DAY) {
                    if (newSchedule[day][hour]) {
                        newSchedule[day][hour] = newSchedule[day][hour].filter((p: ScheduledProject) => p.masterId !== updatedProject.id);
                        if (newSchedule[day][hour].length === 0) {
                            delete newSchedule[day][hour];
                        }
                    }
                }
            }
        }

        for (const [key, probability] of Object.entries(scheduleMap)) {
            if (probability > 0) {
                const [day, hourStr] = key.split('-');
                const hour = parseInt(hourStr, 10) as Hour;

                if (!newSchedule[day]) newSchedule[day] = {};
                if (!newSchedule[day][hour]) newSchedule[day][hour] = [];

                newSchedule[day][hour].push({
                    id: `${updatedProject.id}-${day}-${hour}`,
                    masterId: updatedProject.id,
                    name: updatedProject.name,
                    color: updatedProject.color,
                    probability: probability,
                });
            }
        }
        setSchedule(newSchedule);
        setProjectToSchedule(null);
    };

    const handleUpdateMasterProject = (updatedProject: MasterProject) => {
        setMasterProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        setSchedule(prevSchedule => {
            const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
            for (const day in newSchedule) {
                for (const hour in newSchedule[day]) {
                    newSchedule[day][hour] = newSchedule[day][hour].map((p: ScheduledProject) => {
                        if (p.masterId === updatedProject.id) {
                            return { ...p, name: updatedProject.name, color: updatedProject.color };
                        }
                        return p;
                    });
                }
            }
            return newSchedule;
        });
    };

    const handleDeleteMasterProject = (project: MasterProject) => {
        setConfirmation({
            message: `Are you sure you want to delete "${project.name}"? This will remove it from all time slots.`,
            onConfirm: () => {
                setMasterProjects(prev => prev.filter(p => p.id !== project.id));
                setSchedule(prevSchedule => {
                    const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
                    for (const day in newSchedule) {
                        for (const hour in newSchedule[day]) {
                            newSchedule[day][hour] = newSchedule[day][hour].filter((p: ScheduledProject) => p.masterId !== project.id);
                        }
                    }
                    return newSchedule;
                });
                setConfirmation(null);
            }
        });
    };
    
    const hourRows = useMemo(() => {
        return HOURS_OF_DAY.map(hour => (
            <tr key={hour}>
                <th className="sticky left-0 bg-gray-800/95 backdrop-blur-sm z-20 h-24">
                  <div className="flex items-center justify-center h-full border-r border-gray-700">
                    <span className="font-mono text-xs text-gray-400 -rotate-90 whitespace-nowrap">{`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`}</span>
                  </div>
                </th>
                {DAYS_OF_WEEK.map(day => (
                    <TimeSlotCell
                        key={day}
                        day={day}
                        hour={hour}
                        projects={schedule[day]?.[hour] || []}
                        isEditMode={isEditMode}
                        masterProjects={masterProjects}
                        onAddClick={handleAddProjectClick}
                        onEditClick={handleEditProjectClick}
                    />
                ))}
            </tr>
        ));
    }, [schedule, masterProjects, isEditMode]);


    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'schedule' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
                        <CalendarDaysIcon className="w-5 h-5" />
                        Schedule
                    </button>
                    <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'projects' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
                        <ListBulletIcon className="w-5 h-5" />
                        Projects
                    </button>
                </div>
                <div className="flex items-center gap-4">
                 {activeTab === 'schedule' && (
                    <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${isEditMode ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                    {isEditMode ? <XMarkIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                    {isEditMode ? 'Done' : 'Edit'}
                    </button>
                )}
                <button onClick={onBackToDashboard} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600">
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                    Dashboard
                </button>
                </div>
            </div>

            {activeTab === 'schedule' ? (
                <div className="overflow-auto h-full rounded-lg border border-gray-700 bg-gray-800/20">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-30">
                            <tr>
                                <th className="sticky left-0 bg-gray-800/95 backdrop-blur-sm z-20 w-12 p-0"></th>
                                {DAYS_OF_WEEK.map(day => (
                                    <th key={day} scope="col" className="p-2 text-xs text-center text-gray-300 uppercase border-b border-l border-gray-700 bg-gray-800/95 backdrop-blur-sm">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {masterProjects.length > 0 ? hourRows : (
                                <tr>
                                    <td colSpan={8} className="text-center p-8 text-gray-500">
                                        Please add a project in the 'Projects' tab to start building your schedule.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-y-auto h-full">
                    <ProjectsView
                        projects={masterProjects}
                        onAdd={(p) => setMasterProjects([...masterProjects, p])}
                        onUpdate={handleUpdateMasterProject}
                        onDelete={handleDeleteMasterProject}
                        onOpenScheduleEditor={(p) => setProjectToSchedule(p)}
                    />
                </div>
            )}


            <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)}>
                {selectedSlot && (
                    <ProjectForm
                        project={editingProject}
                        masterProjects={masterProjects}
                        projectsForSlot={schedule[selectedSlot.day]?.[selectedSlot.hour] || []}
                        onSave={handleSaveScheduledProject}
                        onDelete={handleDeleteScheduledProject}
                        onClose={() => setIsSlotModalOpen(false)}
                    />
                )}
            </Modal>

            <Modal isOpen={!!projectToSchedule} onClose={() => setProjectToSchedule(null)} size="5xl">
                {projectToSchedule && (
                    <ProjectScheduleEditor
                        project={projectToSchedule}
                        schedule={schedule}
                        onSave={handleSaveProjectSchedule}
                        onClose={() => setProjectToSchedule(null)}
                    />
                )}
            </Modal>

            <ConfirmationModal
                isOpen={!!confirmation}
                message={confirmation?.message || ''}
                onConfirm={() => confirmation?.onConfirm()}
                onCancel={() => setConfirmation(null)}
            />
        </div>
    );
};

export default ConfigurationView;