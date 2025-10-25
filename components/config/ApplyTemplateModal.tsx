
import React, { useState } from 'react';
import { Day } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import Modal from '../common/Modal';
import { CheckIcon } from '../common/Icons';

interface ApplyTemplateModalProps {
  isOpen: boolean;
  templateName: string;
  onApply: (days: Day[]) => void;
  onClose: () => void;
}

const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({ isOpen, templateName, onApply, onClose }) => {
  const [selectedDays, setSelectedDays] = useState<Set<Day>>(new Set());

  const handleDayToggle = (day: Day) => {
    const newSelection = new Set(selectedDays);
    if (newSelection.has(day)) {
      newSelection.delete(day);
    } else {
      newSelection.add(day);
    }
    setSelectedDays(newSelection);
  };

  const handleSubmit = () => {
    if (selectedDays.size > 0) {
      onApply(Array.from(selectedDays));
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Apply Template: "{templateName}"</h2>
        <div>
          <p className="text-sm text-gray-300 mb-4">Select the days to apply this template to. This will <span className="font-bold text-yellow-400">overwrite</span> any existing schedule for those days.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DAYS_OF_WEEK.map(day => (
              <label key={day} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border-2 ${selectedDays.has(day) ? 'bg-indigo-500/20 border-indigo-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>
                <input
                  type="checkbox"
                  checked={selectedDays.has(day)}
                  onChange={() => handleDayToggle(day)}
                  className="h-5 w-5 rounded bg-gray-900/50 border-gray-500 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-white select-none">{day}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end items-center pt-4 gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={selectedDays.size === 0}>
            <CheckIcon className="w-5 h-5"/>
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApplyTemplateModal;
