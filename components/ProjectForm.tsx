import React, { useState, useEffect } from 'react';
import { ScheduledProject, MasterProject } from '../types';
import { TrashIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

interface ProjectFormProps {
  project: ScheduledProject | null;
  masterProjects: MasterProject[];
  projectsForSlot: ScheduledProject[];
  onSave: (project: ScheduledProject) => void;
  onDelete: (projectId: string) => void;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, masterProjects, projectsForSlot, onSave, onDelete, onClose }) => {
  const [masterId, setMasterId] = useState<string>('');
  const [probability, setProbability] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const availableCapacity = projectsForSlot
    .filter(p => p.id !== project?.id) // Exclude the project being edited
    .reduce((capacity, p) => capacity - p.probability, 1.0);
  
  const remainingCapacity = Math.max(0, availableCapacity);

  useEffect(() => {
    if (project) {
      setMasterId(project.masterId);
      setProbability(project.probability);
    } else {
      setMasterId(masterProjects[0]?.id || '');
      // Default to remaining capacity or 1 if slot is empty
      setProbability(Math.min(1, remainingCapacity > 0.001 ? Number(remainingCapacity.toFixed(2)) : 1));
    }
  }, [project, masterProjects, remainingCapacity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterId) return; // Should not happen with validation
    
    const enteredProbability = Number(probability);
    const maxAllowed = remainingCapacity + (project?.probability || 0);

    if (enteredProbability <= 0) {
        // Silently cap at 0.01 or handle error
        return;
    }
    if (enteredProbability > maxAllowed + 0.001) { // Add tolerance for floating point
        // Silently cap at max or handle error
        return;
    }

    const selectedMaster = masterProjects.find(p => p.id === masterId);
    if (!selectedMaster) return;

    onSave({
      id: project ? project.id : `${masterId}-${new Date().toISOString()}`,
      masterId: selectedMaster.id,
      name: selectedMaster.name,
      color: selectedMaster.color,
      probability: enteredProbability,
    });
  };

  const handleDeleteRequest = () => {
    if(project){
        setShowConfirm(true);
    }
  }

  const confirmDelete = () => {
      if(project) {
          onDelete(project.id);
      }
      setShowConfirm(false);
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{project ? 'Edit Schedule Entry' : 'Add to Schedule'}</h2>
      <div>
        <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-300 mb-2">
          Project
        </label>
        <select
          id="projectSelect"
          value={masterId}
          onChange={(e) => setMasterId(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          required
          disabled={!!project} // Can't change the project, only its probability
        >
            {masterProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="probability" className="block text-sm font-medium text-gray-300">
            Probability Weight
            </label>
            <span className="text-xs text-gray-400">
                Available: {((remainingCapacity + (project?.probability || 0))).toFixed(2)}
            </span>
        </div>
        <input
          type="number"
          id="probability"
          value={probability}
          onChange={(e) => setProbability(Number(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          min="0.01"
          step="0.01"
          max={((remainingCapacity + (project?.probability || 0)))}
          required
        />
      </div>
      <div className="flex justify-between items-center pt-4">
        <div>
        {project && (
            <button
            type="button"
            onClick={handleDeleteRequest}
            className="p-3 bg-red-600/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors flex items-center justify-center"
            aria-label="Delete project from schedule"
            >
             <TrashIcon className="w-5 h-5" />
            </button>
        )}
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
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
            >
            {project ? 'Save Changes' : 'Add to Schedule'}
            </button>
        </div>
      </div>
    </form>
    <ConfirmationModal
        isOpen={showConfirm}
        message={`Are you sure you want to remove "${project?.name}" from this time slot?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
    />
    </>
  );
};

export default ProjectForm;
