import React, { useState, useCallback } from 'react';
import { Day, Hour, ScheduledProject, WeeklySchedule } from '../../types';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../../constants';
import TimeSlotCell from './TimeSlotCell';
import Modal from '../common/Modal';
import ProjectForm from './ProjectForm';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useMasterProjects } from '../../contexts/MasterProjectsContext';
import { useToast } from '../../contexts/ToastContext';
import { SquaresPlusIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, TableCellsIcon, Squares2X2Icon } from '../common/icons';
import ApplyTemplateModal from './ApplyTemplateModal';
import HeatmapView from './HeatmapView';

const ProjectScheduleEditor: React.FC = () => {
  const { schedule, setSchedule } = useSchedule();
  const { masterProjects } = useMasterProjects();
  const { addToast } = useToast();

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: Day; hour: Hour } | null>(null);
  const [selectedProject, setSelectedProject] = useState<ScheduledProject | null>(null);
  const [columnWidth, setColumnWidth] = useState(120);
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');

  const handleAddClick = useCallback((day: Day, hour: Hour) => {
    setSelectedSlot({ day, hour });
    setSelectedProject(null);
    setIsProjectFormOpen(true);
  }, []);

  const handleEditClick = useCallback((project: ScheduledProject, day: Day, hour: Hour) => {
    setSelectedSlot({ day, hour });
    setSelectedProject(project);
    setIsProjectFormOpen(true);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setIsProjectFormOpen(false);
    setSelectedSlot(null);
    setSelectedProject(null);
  }, []);

  const handleSaveProject = useCallback((project: ScheduledProject) => {
    if (!selectedSlot) return;
    const { day, hour } = selectedSlot;

    setSchedule(prevSchedule => {
      const newSchedule: WeeklySchedule = JSON.parse(JSON.stringify(prevSchedule)); // Deep copy
      const daySchedule = newSchedule[day] ?? {};
      const hourProjects = daySchedule[hour] ?? [];

      const existingIndex = hourProjects.findIndex(p => p.id === project.id);
      if (existingIndex > -1) {
        hourProjects[existingIndex] = project; // Update
      } else {
        hourProjects.push(project); // Add
      }
      
      daySchedule[hour] = hourProjects;
      newSchedule[day] = daySchedule;
      return newSchedule;
    });

    addToast(`Project schedule for ${day} at ${hour}:00 updated.`, 'success');
    handleCloseModal();
  }, [selectedSlot, setSchedule, addToast, handleCloseModal]);

  const handleDeleteProject = useCallback((projectId: string) => {
    if (!selectedSlot) return;
    const { day, hour } = selectedSlot;

     setSchedule(prevSchedule => {
      const newSchedule: WeeklySchedule = JSON.parse(JSON.stringify(prevSchedule)); // Deep copy
      const hourProjects = newSchedule[day]?.[hour] ?? [];
      newSchedule[day]![hour] = hourProjects.filter(p => p.id !== projectId);
      return newSchedule;
    });

    addToast(`Project removed from ${day} at ${hour}:00.`, 'success');
    handleCloseModal();
  }, [selectedSlot, setSchedule, addToast, handleCloseModal]);

  const projectsForSelectedSlot = selectedSlot ? schedule[selectedSlot.day]?.[selectedSlot.hour] || [] : [];
  
  const timeColumnWidthPx = 6 * 16;
  const tableMinWidth = (columnWidth * DAYS_OF_WEEK.length) + timeColumnWidthPx;

  return (
    <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
                 {viewMode === 'table' ? 'Click a time slot to add or edit projects.' : 'A visual overview of your weekly schedule.'}
            </p>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-gray-700/50 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}
                        title="Table View"
                        aria-label="Switch to table view"
                    >
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('heatmap')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'heatmap' ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:text-white'}`}
                        title="Heatmap View"
                        aria-label="Switch to heatmap view"
                    >
                        <Squares2X2Icon className="w-5 h-5" />
                    </button>
                </div>

              {viewMode === 'table' && (
                <>
                  <div className="flex items-center gap-2 bg-gray-700/50 px-2 py-1 rounded-lg">
                    <MagnifyingGlassMinusIcon className="w-5 h-5 text-gray-300" />
                    <input
                      type="range"
                      min="80"
                      max="320"
                      value={columnWidth}
                      onChange={(e) => setColumnWidth(Number(e.target.value))}
                      className="w-24 md:w-32 accent-indigo-500"
                      aria-label="Zoom schedule columns"
                    />
                    <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-300" />
                  </div>
                  <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <SquaresPlusIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Apply Template</span>
                  </button>
                </>
              )}
            </div>
        </div>
        <div className="flex-grow overflow-auto bg-gray-900 border border-gray-700 rounded-lg">
            {viewMode === 'table' ? (
                <table className="w-full border-collapse" style={{ minWidth: `${tableMinWidth}px` }}>
                    <thead>
                        <tr>
                            <th className="sticky top-0 left-0 bg-gray-800 p-2 border-r border-b border-gray-700 z-20 text-sm font-medium text-gray-300" style={{ width: '6rem' }}>Time</th>
                            {DAYS_OF_WEEK.map(day => (
                            <th key={day} className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700 z-10 text-sm font-medium text-gray-300" style={{ width: `${columnWidth}px` }}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {HOURS_OF_DAY.map(hour => (
                            <tr key={hour}>
                                <td className="sticky left-0 bg-gray-800 p-2 border-r border-b border-gray-700 text-center text-xs font-mono text-gray-400 z-10">
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                </td>
                                {DAYS_OF_WEEK.map(day => (
                                    <TimeSlotCell
                                    key={`${day}-${hour}`}
                                    day={day}
                                    hour={hour}
                                    projects={schedule[day]?.[hour] || []}
                                    onAddClick={handleAddClick}
                                    onEditClick={handleEditClick}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <HeatmapView />
            )}
        </div>
        <Modal isOpen={isProjectFormOpen} onClose={handleCloseModal}>
            {masterProjects.length > 0 ? (
                <ProjectForm
                    project={selectedProject}
                    projectsForSlot={projectsForSelectedSlot}
                    onSave={handleSaveProject}
                    onDelete={handleDeleteProject}
                    onClose={handleCloseModal}
                />
            ) : (
                <div className="text-center p-4">
                    <h2 className="text-2xl font-bold text-white mb-4">No Projects Found</h2>
                    <p className="text-gray-400">Please create a master project first before adding to the schedule.</p>
                </div>
            )}
        </Modal>
        <ApplyTemplateModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
        />
    </div>
  );
};

export default ProjectScheduleEditor;
