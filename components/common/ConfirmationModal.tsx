import React from 'react';
import Modal from './Modal';
import { TrashIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
            <TrashIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium leading-6 text-white" id="modal-title">
          Confirm Action
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-400">
            {message}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-4">
        <button
          type="button"
          className="px-6 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-500"
          onClick={onConfirm}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
