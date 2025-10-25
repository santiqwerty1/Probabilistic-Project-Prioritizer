import React, { useState, useEffect } from 'react';
import { MasterProject } from '../../types';
import { PROJECT_COLORS } from '../../constants';
import { generateUUID } from '../../utils';
import { useMasterProjects } from '../../contexts/MasterProjectsContext';

interface ProjectMasterFormProps {
  project: MasterProject | null;
  onSave: (project: MasterProject) => void;
  onClose: () => void;
}

const ProjectMasterForm: React.FC<ProjectMasterFormProps> = ({ project, onSave, onClose }) => {
  const { masterProjects } = useMasterProjects();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color);
    } else {
        // Find a color that's not already in use
        const usedColors = new Set(masterProjects.map(p => p.color));
        const availableColor = PROJECT_COLORS.find(c => !usedColors.has(c));
        setColor(availableColor || PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]);
    }
  }, [project, masterProjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: project ? project.id : generateUUID(),
      name: name.trim(),
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{project ? 'Edit Project' : 'Add New Project'}</h2>
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">
          Project Name
        </label>
        <input
          type="text"
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-3">
          {PROJECT_COLORS.map(c => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
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
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
        >
          {project ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectMasterForm;
