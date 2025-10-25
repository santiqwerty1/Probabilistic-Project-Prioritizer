
import React, { useState, useCallback } from 'react';
import { Day, Hour, WeeklySchedule, ScheduledProject, MasterProject } from '../../types';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../../constants';
import { CalendarDaysIcon, ListBulletIcon, ArrowUturnLeftIcon, SquaresPlusIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, Squares2X2Icon, TableCellsIcon } from '../common/Icons';
import Modal from '../common/Modal';
import ProjectForm from './ProjectForm';
import ProjectsView from './ProjectsView';
import ProjectScheduleEditor from './ProjectScheduleEditor';
import TimeSlotCell from './TimeSlotCell';
import ConfirmationModal from '../common/ConfirmationModal';
import { useSchedule } from '../../contexts/ScheduleContext';
import TemplatesView from './TemplatesView';
import HeatmapView from './HeatmapView';
import { useToast } from '../../contexts/ToastContext';

interface ConfigurationViewProps {
    onBackToDashboard: () => void;
}

const EMPTY_PROJECT_LIST: ScheduledProject[] = [];

// Moved outside the main component to prevent re-definition on every render.
// This allows React.memo to work correctly, providing a significant performance boost.
const HourRow = React.memo(({ hour, schedule, masterProjects, handleAddProjectClick, handleEditProjectClick }: {
    hour: Hour;
    schedule: WeeklySchedule;
    masterProjects: MasterProject[];
    handleAddProjectClick: (day: Day, hour: Hour) => void;
    handleEditProjectClick: (project: ScheduledProject, day: Day, hour: Hour) => void;
}) => {
    return (
        <tr>
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
                    projects={schedule[day]?.[hour] || EMPTY_PROJECT_LIST}
                    masterProjects={masterProjects}
                    onAddClick={handleAddProjectClick}
                    onEditClick={handleEditProjectClick}
                />
            ))}
        </tr>
    );
});


const ConfigurationView: React.FC<ConfigurationViewProps> = ({
    onBackToDashboard
}) => {
    const { schedule, setSchedule, masterProjects, updateMasterProject, deleteMasterProject } = useSchedule();
    const { addToast } = useToast();

    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [projectToSchedule, setProjectToSchedule] = useState<MasterProject | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ day: Day; hour: Hour } | null>(null);
    const [editingProject, setEditingProject] = useState<ScheduledProject | null>(null);
    const [activeTab, setActiveTab] = useState<'schedule' | 'projects' | 'templates'>('schedule');
    const [viewMode, setViewMode] = useState<'detail' | 'heatmap'>('detail');
    const [columnWidth, setColumnWidth] = useState(120);
    const [confirmation, setConfirmation] = useState<{
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const handleAddProjectClick = useCallback((day: Day, hour: Hour) => {
        setSelectedSlot({ day, hour });
        setEditingProject(null);
        setIsSlotModalOpen(true);
    }, []);

    const handleEditProjectClick = useCallback((project: ScheduledProject, day: Day, hour: Hour) => {
        setSelectedSlot({ day, hour });
        setEditingProject(project);
        setIsSlotModalOpen(true);
    }, []);

    const handleSaveScheduledProject = (project: ScheduledProject) => {
        if (!selectedSlot) return;
        const { day, hour } = selectedSlot;

        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            const dayKey = day as Day;
            const hourKey = hour as Hour;
            if (!newSchedule[dayKey]) newSchedule[dayKey] = {};
            if (!newSchedule[dayKey]![hourKey]) newSchedule[dayKey]![hourKey] = [];

            const projects = [...(newSchedule[dayKey]![hourKey] || [])];
            const existingIndex = projects.findIndex(p => p.id === project.id);

            if (existingIndex > -1) {
                projects[existingIndex] = project;
            } else {
                projects.push(project);
            }

            newSchedule[dayKey]![hourKey] = projects;
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
            const dayKey = day as Day;
            const hourKey = hour as Hour;
            
            const daySchedule = newSchedule[dayKey];
            if (!daySchedule?.[hourKey]) return newSchedule;

            const updatedProjects = daySchedule[hourKey]!.filter(p => p.id !== projectId);

            if (updatedProjects.length > 0) {
                daySchedule[hourKey] = updatedProjects;
            } else {
                delete daySchedule[hourKey];
                if (Object.keys(daySchedule).length === 0) {
                    delete newSchedule[dayKey];
                }
            }
            return newSchedule;
        });

        setIsSlotModalOpen(false);
        setEditingProject(null);
    }

    const handleSaveProjectSchedule = (
        updatedProject: MasterProject,
        scheduleMap: { [key: string]: number }
    ) => {
        updateMasterProject(updatedProject);

        setSchedule(prevSchedule => {
            const newSchedule = JSON.parse(JSON.stringify(prevSchedule));

            // Remove all existing instances of the project
            for (const day of DAYS_OF_WEEK) {
                if (newSchedule[day]) {
                    for (const hour of HOURS_OF_DAY) {
                        if (newSchedule[day][hour]) {
                            newSchedule[day][hour] = newSchedule[day][hour]!.filter((p: ScheduledProject) => p.masterId !== updatedProject.id);
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
            
            // Add the new instances from the schedule map
            for (const [key, probability] of Object.entries(scheduleMap)) {
                if (probability > 0) {
                    const [day, hourStr] = key.split('-');
                    const dayKey = day as Day;
                    const hourKey = parseInt(hourStr, 10) as Hour;

                    if (!newSchedule[dayKey]) newSchedule[dayKey] = {};
                    if (!newSchedule[dayKey]![hourKey]) newSchedule[dayKey]![hourKey] = [];

                    newSchedule[dayKey]![hourKey]!.push({
                        id: `${updatedProject.id}-${dayKey}-${hourKey}`,
                        masterId: updatedProject.id,
                        name: updatedProject.name,
                        color: updatedProject.color,
                        probability: probability,
                    });
                }
            }
            return newSchedule;
        });

        setProjectToSchedule(null);
        addToast('Schedule saved successfully', 'success');
    };

    const handleDeleteMasterProjectWithConfirmation = (project: MasterProject) => {
        setConfirmation({
            message: `Are you sure you want to delete "${project.name}"? This will remove it from all time slots.`,
            onConfirm: () => {
                deleteMasterProject(project.id);
                setConfirmation(null);
                addToast(`Project "${project.name}" deleted`, 'success');
            }
        });
    };
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'schedule' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Schedule</span>
                    </button>
                    <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'projects' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
                        <ListBulletIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Projects</span>
                    </button>
                    <button onClick={() => setActiveTab('templates')} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'templates' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
                        <SquaresPlusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Templates</span>
                    </button>
                </div>
                <div className="flex items-center gap-4">
                 {activeTab === 'schedule' && (
                    <>
                        <button
                            onClick={() => setViewMode(viewMode === 'detail' ? 'heatmap' : 'detail')}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600"
                            title={viewMode === 'detail' ? 'Switch to Heatmap View' : 'Switch to Detail View'}
                        >
                            {viewMode === 'detail' ? <Squares2X2Icon className="w-4 h-4" /> : <TableCellsIcon className="w-4 h-4" />}
                            <span className="hidden md:inline">{viewMode === 'detail' ? 'Heatmap' : 'Detail'}</span>
                        </button>
                        
                        {viewMode === 'detail' && (
                            <div className="flex items-center gap-2">
                                <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-400" />
                                <input
                                    type="range"
                                    id="zoom"
                                    min="80"
                                    max="320"
                                    value={columnWidth}
                                    onChange={(e) => setColumnWidth(Number(e.target.value))}
                                    className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    title="Zoom schedule view"
                                />
                                <MagnifyingGlassMinusIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                    </>
                )}
                <button onClick={onBackToDashboard} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600">
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                </button>
                </div>
            </div>

            {activeTab === 'schedule' ? (
                viewMode === 'detail' ? (
                    <div className="overflow-auto rounded-lg border border-gray-700 bg-gray-800/20">
                        <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
                             <colgroup>
                                <col className="w-12" />
                                {DAYS_OF_WEEK.map(day => (
                                    <col key={day} style={{ width: `${columnWidth}px` }} />
                                ))}
                            </colgroup>
                            <thead className="sticky top-0 z-30">
                                <tr>
                                    <th className="sticky left-0 bg-gray-800/95 backdrop-blur-sm z-20 w-12 p-0"></th>
                                    {DAYS_OF_WEEK.map(day => (
                                        <th 
                                            key={day} 
                                            scope="col" 
                                            className="p-2 text-xs text-center text-gray-300 uppercase border-b border-l border-gray-700 bg-gray-800/95 backdrop-blur-sm"
                                        >
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {masterProjects.length > 0 ? (
                                    HOURS_OF_DAY.map(hour => (
                                        <HourRow
                                            key={hour}
                                            hour={hour}
                                            schedule={schedule}
                                            masterProjects={masterProjects}
                                            handleAddProjectClick={handleAddProjectClick}
                                            handleEditProjectClick={handleEditProjectClick}
                                        />
                                    ))
                                ) : (
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
                    <HeatmapView />
                )
            ) : activeTab === 'projects' ? (
                <div className="overflow-y-auto h-full">
                    <ProjectsView
                        onDelete={handleDeleteMasterProjectWithConfirmation}
                        onOpenScheduleEditor={(p) => setProjectToSchedule(p)}
                    />
                </div>
            ) : (
                 <div className="overflow-y-auto h-full">
                    <TemplatesView />
                </div>
            )}


            <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)}>
                {selectedSlot && (
                    <ProjectForm
                        project={editingProject}
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
