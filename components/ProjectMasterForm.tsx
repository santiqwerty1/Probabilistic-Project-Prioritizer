import React, { useState, useEffect } from 'react';
import { MasterProject } from '../types';
import { TagIcon } from './Icons';

interface ProjectMasterFormProps {
  project: MasterProject | null;
  onSave: (project: MasterProject) => void;
  onClose: () => void;
}

const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', 
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', 
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
];

const ProjectMasterForm: React.FC<ProjectMasterFormProps> = ({ project, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color);
    } else {
      setName('');
      // Get a random color for a new project
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Project name cannot be empty.");
        return;
    }

    onSave({
      id: project ? project.id : `proj-${Date.now()}`,
      name,
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{project ? 'Edit Project' : 'Create New Project'}</h2>
      <div>
        <label htmlFor="masterProjectName" className="block text-sm font-medium text-gray-300 mb-2">
          Project Name
        </label>
        <input
          type="text"
          id="masterProjectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          placeholder="e.g., Deep Work"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
                <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                    style={{backgroundColor: c}}
                    aria-label={`Select color ${c}`}
                />
            ))}
        </div>
      </div>
      
      <div className="flex justify-end items-center pt-4 gap-4">
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