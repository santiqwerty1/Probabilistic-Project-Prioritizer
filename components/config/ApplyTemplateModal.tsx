import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useTemplates } from '../../contexts/TemplatesContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { Day, WeeklySchedule } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import { useToast } from '../../contexts/ToastContext';

interface ApplyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({ isOpen, onClose }) => {
  const { templates } = useTemplates();
  const { setSchedule } = useSchedule();
  const { addToast } = useToast();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<Record<Day, boolean>>({
    Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false
  });
  
  const handleDayToggle = (day: Day) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };
  
  const handleApply = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    const daysToApply = Object.entries(selectedDays).filter(([, isSelected]) => isSelected).map(([day]) => day as Day);
    
    if (!template || daysToApply.length === 0) {
        addToast('Please select a template and at least one day.', 'error');
        return;
    }
    
    setSchedule(prevSchedule => {
        const newSchedule: WeeklySchedule = JSON.parse(JSON.stringify(prevSchedule));
        daysToApply.forEach(day => {
            newSchedule[day] = template.schedule;
        });
        return newSchedule;
    });

    addToast(`Template "${template.name}" applied to ${daysToApply.length} day(s).`, 'success');
    onClose();
  };
  
  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTemplateId(templates[0]?.id || '');
      setSelectedDays({
        Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false
      });
    }
  }, [isOpen, templates]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Apply a Day Template</h2>
        
        {templates.length > 0 ? (
          <>
            <div>
              <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-300 mb-2">
                1. Select Template
              </label>
              <select
                id="templateSelect"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                2. Select Day(s) to Apply To
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`p-3 text-center rounded-lg border-2 transition-colors ${selectedDays[day] ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
               <p className="text-xs text-gray-400 mt-2">Warning: This will overwrite the existing schedule for the selected day(s).</p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Apply Template
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-gray-400">
            <p>No templates have been created yet.</p>
            <p>Go to the Templates tab to create one first.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ApplyTemplateModal;
