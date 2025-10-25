
import React, { useState, useEffect } from 'react';
import { DayTemplate, Hour, ScheduledProject } from '../../types';
import { HOURS_OF_DAY } from '../../constants';
import Modal from '../common/Modal';
import ProjectForm from './ProjectForm';
import { useSchedule } from '../../contexts/ScheduleContext';
import { PlusIcon, TrashIcon } from '../common/Icons';

interface TemplateEditorModalProps {
  isOpen: boolean;
  template: DayTemplate | null;
  onSave: (template: DayTemplate) => void;
  onClose: () => void;
}

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ isOpen, template, onSave, onClose }) => {
  const { masterProjects } = useSchedule();
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<DayTemplate['schedule']>({});
  
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<Hour | null>(null);
  const [editingProject, setEditingProject] = useState<ScheduledProject | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (template) {
            setName(template.name);
            setSchedule(template.schedule);
        } else {
            setName('');
            setSchedule({});
        }
    }
  }, [isOpen, template]);

  const handleAddProjectClick = (hour: Hour) => {
    setSelectedHour(hour);
    setEditingProject(null);
    setIsSlotModalOpen(true);
  };

  const handleEditProjectClick = (project: ScheduledProject, hour: Hour) => {
    setSelectedHour(hour);
    setEditingProject(project);
    setIsSlotModalOpen(true);
  }

  const handleSaveScheduledProject = (project: ScheduledProject) => {
    if (selectedHour === null) return;
    
    setSchedule(prev => {
        const newSchedule = { ...prev };
        const projects = [...(newSchedule[selectedHour] || [])];
        const existingIndex = projects.findIndex(p => p.id === project.id);

        if (existingIndex > -1) {
            projects[existingIndex] = project;
        } else {
            projects.push(project);
        }
        newSchedule[selectedHour] = projects;
        return newSchedule;
    });

    setIsSlotModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteScheduledProject = (projectId: string) => {
    if (selectedHour === null) return;
    setSchedule(prev => {
        const newSchedule = { ...prev };
        if (!newSchedule[selectedHour]) return newSchedule;
        
        newSchedule[selectedHour] = newSchedule[selectedHour]?.filter(p => p.id !== projectId);
        if(newSchedule[selectedHour]?.length === 0) {
            delete newSchedule[selectedHour];
        }
        return newSchedule;
    });
    setIsSlotModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
        alert("Template name cannot be empty.");
        return;
    }
    onSave({
        id: template ? template.id : `template-${Date.now()}`,
        name,
        schedule
    });
  }

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">{template ? 'Edit Template' : 'Create New Template'}</h2>
        
        <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
            <input 
                type="text" 
                id="templateName"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Productive Workday"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
            />
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-[50vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Day Schedule</h3>
            <div className="space-y-2">
                {HOURS_OF_DAY.map(hour => {
                    const projects = schedule[hour] || [];
                    const totalWeight = projects.reduce((sum, p) => sum + p.probability, 0);

                    return (
                        <div key={hour} className="flex items-start gap-3 p-2 rounded-md bg-gray-800/70">
                            <div className="w-20 text-right font-mono text-sm text-gray-400 shrink-0 pt-1">
                                {hour}:00 - {hour+1}:00
                            </div>
                            <div className="flex-grow border-l border-gray-600 pl-3">
                                {projects.length > 0 ? (
                                    <div className="space-y-1">
                                    {projects.map(p => (
                                        <div key={p.id} onClick={() => handleEditProjectClick(p, hour)} className="flex justify-between items-center bg-gray-700 p-1.5 rounded cursor-pointer hover:bg-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: p.color}}></div>
                                                <span className="text-sm font-medium">{p.name}</span>
                                            </div>
                                            <span className="text-sm font-mono text-gray-300">{(p.probability * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic pt-1">No projects scheduled.</p>
                                )}
                            </div>
                            {totalWeight < 1 && masterProjects.length > 0 && (
                                <button onClick={() => handleAddProjectClick(hour)} className="p-2 bg-gray-700 rounded-full text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors">
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>

        <div className="flex justify-end items-center pt-4 gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors">
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </Modal>
    
    <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)}>
        {selectedHour !== null && (
            <ProjectForm
                project={editingProject}
                projectsForSlot={schedule[selectedHour] || []}
                onSave={handleSaveScheduledProject}
                onDelete={handleDeleteScheduledProject}
                onClose={() => setIsSlotModalOpen(false)}
            />
        )}
    </Modal>
    </>
  );
};

export default TemplateEditorModal;
