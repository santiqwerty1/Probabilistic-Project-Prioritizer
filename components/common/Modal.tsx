import React, { ReactNode } from 'react';
import { XMarkIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    'md': 'max-w-md',
    '5xl': 'max-w-5xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex overflow-y-auto p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-gray-800 rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]} m-auto relative border border-gray-700`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
