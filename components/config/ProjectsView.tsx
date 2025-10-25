import React, { useState } from 'react';
import { MasterProject } from '../../types';
import { TrashIcon, PlusIcon } from '../common/Icons';
import Modal from '../common/Modal';
import ProjectMasterForm from './ProjectMasterForm';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useToast } from '../../contexts/ToastContext';

interface ProjectsViewProps {
  onDelete: (project: MasterProject) => void;
  onOpenScheduleEditor: (project: MasterProject) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onDelete, onOpenScheduleEditor }) => {
  const { masterProjects, addMasterProject, updateMasterProject } = useSchedule();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<MasterProject | null>(null);

  const handleAddClick = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, project: MasterProject) => {
    e.stopPropagation(); // Prevent opening the schedule editor
    onDelete(project);
  }

  const handleSave = (project: MasterProject) => {
    if (editingProject) {
      updateMasterProject(project);
      addToast('Project updated successfully', 'success');
    } else {
      addMasterProject(project);
      addToast('Project created successfully', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Master Project List</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        {masterProjects.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {masterProjects.map(project => (
              <li 
                key={project.id} 
                className="flex items-center justify-between p-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => onOpenScheduleEditor(project)}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-6 h-6 rounded-full border-2 border-gray-600"
                    style={{ backgroundColor: project.color }}
                  ></span>
                  <span className="font-medium text-white">{project.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleDeleteClick(e, project)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" aria-label="Delete project">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
            <div className="text-center p-8 text-gray-500">
                <p>No projects found.</p>
                <p className="mt-2 text-sm">Click "New Project" to get started.</p>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProjectMasterForm
          project={editingProject}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProjectsView;