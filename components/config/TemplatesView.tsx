import React, { useState } from 'react';
import { Day, DayTemplate } from '../../types';
import { useSchedule } from '../../contexts/ScheduleContext';
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon, PencilIcon } from '../common/Icons';
import ConfirmationModal from '../common/ConfirmationModal';
import TemplateEditorModal from './TemplateEditorModal';
import ApplyTemplateModal from './ApplyTemplateModal';
import { useToast } from '../../contexts/ToastContext';

const TemplatesView: React.FC = () => {
    const { templates, addTemplate, updateTemplate, deleteTemplate, applyTemplate } = useSchedule();
    const { addToast } = useToast();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    
    const [activeTemplate, setActiveTemplate] = useState<DayTemplate | null>(null);
    const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

    const handleOpenCreator = () => {
        setActiveTemplate(null);
        setIsEditorOpen(true);
    };

    const handleOpenEditor = (template: DayTemplate) => {
        setActiveTemplate(template);
        setIsEditorOpen(true);
    };

    const handleOpenApply = (template: DayTemplate) => {
        setActiveTemplate(template);
        setIsApplyOpen(true);
    };

    const handleSave = (template: DayTemplate) => {
        if (activeTemplate) {
            updateTemplate(template);
            addToast('Template updated successfully', 'success');
        } else {
            addTemplate(template);
            addToast('Template created successfully', 'success');
        }
        setIsEditorOpen(false);
    };

    const handleApply = (days: Day[]) => {
        if(activeTemplate){
            applyTemplate(activeTemplate.id, days);
            addToast(`Template "${activeTemplate.name}" applied`, 'success');
        }
        setIsApplyOpen(false);
    };

    const handleDeleteRequest = (template: DayTemplate) => {
        setDeletingTemplateId(template.id);
    };
    
    const confirmDelete = () => {
        if(deletingTemplateId){
            deleteTemplate(deletingTemplateId);
            addToast('Template deleted successfully', 'success');
        }
        setDeletingTemplateId(null);
    };

    const templateToDelete = templates.find(t => t.id === deletingTemplateId);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Schedule Templates</h2>
                <button
                onClick={handleOpenCreator}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                >
                <PlusIcon className="w-5 h-5" />
                New Template
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700">
                {templates.length > 0 ? (
                <ul className="divide-y divide-gray-700">
                    {templates.map(template => (
                    <li 
                        key={template.id} 
                        className="flex items-center justify-between p-4"
                    >
                        <span className="font-medium text-white">{template.name}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleOpenApply(template)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 rounded-md hover:bg-gray-600 transition-colors" aria-label="Apply template">
                                <ClipboardDocumentListIcon className="w-4 h-4"/>
                                Apply
                            </button>
                             <button onClick={() => handleOpenEditor(template)} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Edit template">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteRequest(template)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" aria-label="Delete template">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <p>No templates found.</p>
                        <p className="mt-2 text-sm">Click "New Template" to create a reusable day schedule.</p>
                    </div>
                )}
            </div>

            <TemplateEditorModal
                isOpen={isEditorOpen}
                template={activeTemplate}
                onSave={handleSave}
                onClose={() => setIsEditorOpen(false)}
            />

            {activeTemplate && (
                <ApplyTemplateModal
                    isOpen={isApplyOpen}
                    templateName={activeTemplate.name}
                    onApply={handleApply}
                    onClose={() => setIsApplyOpen(false)}
                />
            )}
            
            <ConfirmationModal
                isOpen={!!deletingTemplateId}
                message={`Are you sure you want to delete the template "${templateToDelete?.name}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeletingTemplateId(null)}
            />
        </div>
    );
};

export default TemplatesView;