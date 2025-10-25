import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { DayTemplate, Hour, ScheduledProject } from '../../types';
import { HOURS_OF_DAY } from '../../constants';
import { generateUUID } from '../../utils';
import HourScheduleEditorModal from './HourScheduleEditorModal';
import { PencilIcon } from '../common/icons';

interface TemplateEditorModalProps {
  isOpen: boolean;
  template: DayTemplate | null;
  onSave: (template: DayTemplate) => void;
  onClose: () => void;
}

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ isOpen, template, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<DayTemplate['schedule']>({});

  // State for the new hour editor modal
  const [isHourEditorOpen, setIsHourEditorOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<Hour | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSchedule(template.schedule);
    } else {
      setName('');
      setSchedule({});
    }
  }, [template, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: template?.id || generateUUID(),
      name: name.trim(),
      schedule,
    });
  };

  const handleOpenHourEditor = (hour: Hour) => {
    setSelectedHour(hour);
    setIsHourEditorOpen(true);
  };

  const handleCloseHourEditor = () => {
    setIsHourEditorOpen(false);
    setSelectedHour(null);
  };
  
  const handleSaveHourSchedule = (projects: ScheduledProject[]) => {
    if (selectedHour === null) return;
    setSchedule(prev => {
        const newSchedule = { ...prev };
        if (projects.length > 0) {
            newSchedule[selectedHour] = projects;
        } else {
            delete newSchedule[selectedHour];
        }
        return newSchedule;
    });
  };

  const projectsForSelectedHour = selectedHour !== null ? schedule[selectedHour] || [] : [];
  
  const renderProjectSummary = (projects: ScheduledProject[]) => {
    if (projects.length === 0) {
        return <span className="text-gray-500 italic">No projects assigned</span>;
    }
    return (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
            {projects.map(p => (
                <div key={p.id} className="flex items-center gap-1.5 text-xs bg-gray-700 px-2 py-0.5 rounded">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: p.color}} />
                    <span>{p.name}</span>
                    <span className="text-gray-400">({p.probability.toFixed(0)}%)</span>
                </div>
            ))}
        </div>
    );
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="flex flex-col h-[80vh]">
        <h2 className="text-2xl font-bold text-white mb-4 flex-shrink-0">{template ? 'Edit Template' : 'Create New Template'}</h2>
        
        <div className="mb-6 flex-shrink-0">
          <label htmlFor="templateName" className="block text-sm font-medium text-gray-300 mb-2">
            Template Name
          </label>
          <input
            type="text"
            id="templateName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-sm bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="e.g., Productive Workday"
            required
          />
        </div>

        <p className="text-sm text-gray-400 mb-4 flex-shrink-0">Configure the schedule for this template by adding projects to each hour.</p>

        <div className="flex-grow overflow-y-auto bg-gray-900/50 p-2 border border-gray-700 rounded-lg">
          <div className="space-y-1">
              {HOURS_OF_DAY.map(hour => {
                const projects = schedule[hour] || [];
                return (
                  <button 
                    key={hour}
                    onClick={() => handleOpenHourEditor(hour)}
                    className="group w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                    aria-label={`Configure schedule for ${hour.toString().padStart(2, '0')}:00`}
                  >
                    <div className="flex items-center flex-grow min-w-0">
                      <div className="w-24 text-center font-mono text-gray-400 flex-shrink-0">{`${hour.toString().padStart(2, '0')}:00`}</div>
                      <div className="flex-grow px-4 truncate">
                          {renderProjectSummary(projects)}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <PencilIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </Modal>

    {isHourEditorOpen && selectedHour !== null && (
        <HourScheduleEditorModal
            isOpen={isHourEditorOpen}
            onClose={handleCloseHourEditor}
            onSave={handleSaveHourSchedule}
            initialProjects={projectsForSelectedHour}
            hour={selectedHour}
        />
    )}
    </>
  );
};

export default TemplateEditorModal;