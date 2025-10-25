import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { ScheduledProject, Hour } from '../../types';
import { useMasterProjects } from '../../contexts/MasterProjectsContext';
import { TrashIcon } from '../common/icons';
import { generateUUID } from '../../utils';
import { EPSILON } from '../../constants';

interface HourScheduleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projects: ScheduledProject[]) => void;
  initialProjects: ScheduledProject[];
  hour: Hour;
}

const HourScheduleEditorModal: React.FC<HourScheduleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProjects,
  hour,
}) => {
  const { masterProjects } = useMasterProjects();
  const [projects, setProjects] = useState<ScheduledProject[]>([]);
  const [selectedNewProjectId, setSelectedNewProjectId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const projectsCopy = JSON.parse(JSON.stringify(initialProjects));
      setProjects(projectsCopy);
      const availableProject = masterProjects.find(mp => !projectsCopy.some((p: ScheduledProject) => p.masterId === mp.id));
      setSelectedNewProjectId(availableProject?.id || '');
    }
  }, [isOpen, initialProjects, masterProjects]);

  const totalProbability = useMemo(() => projects.reduce((sum, p) => sum + p.probability, 0), [projects]);
  const remainingProbability = 100.0 - totalProbability;

  const handleProbabilityChange = (projectId: string, newProbStr: string) => {
    const newProb = Number(newProbStr);
    setProjects(currentProjects =>
      currentProjects.map(p =>
        p.id === projectId ? { ...p, probability: isNaN(newProb) ? 0 : newProb } : p
      )
    );
  };

  const handleRemoveProject = (projectId: string) => {
    setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));
  };
  
  const handleAddProject = () => {
    if (!selectedNewProjectId) return;
    const masterProject = masterProjects.find(mp => mp.id === selectedNewProjectId);
    if (!masterProject) return;

    const newProject: ScheduledProject = {
      ...masterProject,
      id: generateUUID(),
      masterId: masterProject.id,
      probability: Math.max(1, Number(remainingProbability.toFixed(0))),
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    const nextAvailableProject = masterProjects.find(mp => !updatedProjects.some(p => p.masterId === mp.id));
    setSelectedNewProjectId(nextAvailableProject?.id || '');
  };

  const handleSaveChanges = () => {
    if (totalProbability > 100 + EPSILON) {
      alert("Total probability cannot exceed 100%");
      return;
    }
    // Filter out any projects with < 1 probability before saving
    onSave(projects.filter(p => p.probability >= 1));
    onClose();
  };

  const availableProjectsToAdd = masterProjects.filter(mp => !projects.some(p => p.masterId === mp.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          Configure Schedule for {`${hour.toString().padStart(2, '0')}:00`}
        </h2>
        
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {projects.length > 0 ? projects.map(p => (
                <div key={p.id} className="flex items-center gap-4 bg-gray-700/50 p-3 rounded-lg">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="font-medium text-white flex-grow truncate">{p.name}</span>
                    <input
                        type="number"
                        value={p.probability}
                        onChange={(e) => handleProbabilityChange(p.id, e.target.value)}
                        className="w-24 bg-gray-800 border border-gray-600 text-white rounded-md p-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        min="1"
                        step="1"
                        max="100"
                    />
                    <button
                        onClick={() => handleRemoveProject(p.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        aria-label={`Remove ${p.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )) : <p className="text-gray-400 text-center py-4">No projects assigned to this hour.</p>}
        </div>

        {availableProjectsToAdd.length > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                <select
                    value={selectedNewProjectId}
                    onChange={(e) => setSelectedNewProjectId(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                    {availableProjectsToAdd.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <button
                    onClick={handleAddProject}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors whitespace-nowrap"
                >
                    Add Project
                </button>
            </div>
        )}

        <div className="flex justify-between items-center pt-4">
            <div className="text-sm font-medium">
                <span className="text-gray-300">Total Probability: </span>
                <span className={totalProbability > 100 + EPSILON ? 'text-red-400' : 'text-green-400'}>
                    {totalProbability.toFixed(0)}%
                </span>
            </div>
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={totalProbability > 100 + EPSILON}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default HourScheduleEditorModal;