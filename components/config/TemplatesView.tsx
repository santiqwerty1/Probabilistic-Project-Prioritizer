import React, { useState } from 'react';
import { useTemplates } from '../../contexts/TemplatesContext';
import { DayTemplate } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../common/icons';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import TemplateEditorModal from './TemplateEditorModal';
import { useToast } from '../../contexts/ToastContext';

const TemplatesView: React.FC = () => {
  const { templates, setTemplates } = useTemplates();
  const { addToast } = useToast();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DayTemplate | null>(null);

  const handleAdd = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: DayTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDeleteRequest = (template: DayTemplate) => {
    setSelectedTemplate(template);
    setIsConfirmOpen(true);
  };

  const handleSave = (template: DayTemplate) => {
    if (selectedTemplate) { // Editing
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      addToast('Template updated successfully!', 'success');
    } else { // Adding
      setTemplates(prev => [...prev, template]);
      addToast('Template created successfully!', 'success');
    }
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  const confirmDelete = () => {
    if (!selectedTemplate) return;
    setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
    addToast('Template deleted successfully!', 'success');
    setIsConfirmOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Day Templates</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Create Template
        </button>
      </div>
      <div className="flex-grow bg-gray-900/50 rounded-lg border border-gray-700 overflow-y-auto">
        <ul className="divide-y divide-gray-700">
          {templates.length > 0 ? (
            templates.map(template => (
              <li key={template.id} className="flex items-center justify-between p-4">
                <span className="font-medium text-white">{template.name}</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleEdit(template)} className="text-gray-400 hover:text-indigo-400 transition-colors" title="Edit template">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteRequest(template)} className="text-gray-400 hover:text-red-400 transition-colors" title="Delete template">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <div className="text-center p-8 text-gray-400">
                <p>No templates created yet.</p>
                <p>Templates allow you to quickly apply a pre-defined schedule to a day.</p>
            </div>
          )}
        </ul>
      </div>
      {isEditorOpen && (
        <TemplateEditorModal
            isOpen={isEditorOpen}
            template={selectedTemplate}
            onSave={handleSave}
            onClose={() => {
                setIsEditorOpen(false);
                setSelectedTemplate(null);
            }}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        message={`This will permanently delete the "${selectedTemplate?.name}" template.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText="Delete"
      />
    </div>
  );
};

export default TemplatesView;