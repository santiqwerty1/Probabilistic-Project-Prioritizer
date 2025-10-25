import React, { useState } from 'react';
import { useMasterProjects } from '../../contexts/MasterProjectsContext';
import { MasterProject } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../common/icons';
import Modal from '../common/Modal';
import ProjectMasterForm from './ProjectMasterForm';
import ConfirmationModal from '../common/ConfirmationModal';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useToast } from '../../contexts/ToastContext';

const ProjectsView: React.FC = () => {
  const { masterProjects, setMasterProjects } = useMasterProjects();
  const { schedule, setSchedule } = useSchedule();
  const { addToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<MasterProject | null>(null);

  const handleAdd = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: MasterProject) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (project: MasterProject) => {
    setSelectedProject(project);
    setIsConfirmOpen(true);
  };

  const handleSave = (project: MasterProject) => {
    if (selectedProject) { // Editing existing
      setMasterProjects(prev => prev.map(p => p.id === project.id ? project : p));
      
      // Also update name and color in the schedule
      const newSchedule = { ...schedule };
      Object.keys(newSchedule).forEach(day => {
        Object.keys(newSchedule[day]!).forEach(hour => {
          newSchedule[day]![hour] = newSchedule[day]![hour]!.map(sp => 
            sp.masterId === project.id ? { ...sp, name: project.name, color: project.color } : sp
          );
        });
      });
      setSchedule(newSchedule);
      addToast('Project updated successfully!', 'success');
    } else { // Adding new
      setMasterProjects(prev => [...prev, project]);
      addToast('Project added successfully!', 'success');
    }
    setIsFormOpen(false);
    setSelectedProject(null);
  };
  
  const confirmDelete = () => {
    if (!selectedProject) return;

    // Check if project is in use
    const isInUse = Object.values(schedule).some(daySchedule =>
        Object.values(daySchedule).some(hourProjects =>
            hourProjects.some(p => p.masterId === selectedProject.id)
        )
    );
    
    if (isInUse) {
        addToast('Cannot delete project because it is currently used in the schedule.', 'error');
        setIsConfirmOpen(false);
        setSelectedProject(null);
        return;
    }

    setMasterProjects(prev => prev.filter(p => p.id !== selectedProject.id));
    addToast('Project deleted successfully!', 'success');
    setIsConfirmOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Master Project List</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Project
        </button>
      </div>
      <div className="flex-grow bg-gray-900/50 rounded-lg border border-gray-700 overflow-y-auto">
        <ul className="divide-y divide-gray-700">
          {masterProjects.length > 0 ? (
            masterProjects.map(project => (
              <li key={project.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                  <span className="font-medium text-white">{project.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleEdit(project)} className="text-gray-400 hover:text-indigo-400 transition-colors" title="Edit project">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteRequest(project)} className="text-gray-400 hover:text-red-400 transition-colors" title="Delete project">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <div className="text-center p-8 text-gray-400">
                <p>No master projects created yet.</p>
                <p>Click "Add Project" to get started.</p>
            </div>
          )}
        </ul>
      </div>
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ProjectMasterForm
          project={selectedProject}
          onSave={handleSave}
          onClose={() => setIsFormOpen(false)}
        />
      </Modal>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        message={`This will permanently delete the "${selectedProject?.name}" project. This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText="Delete"
      />
    </div>
  );
};

export default ProjectsView;