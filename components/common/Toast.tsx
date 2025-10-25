import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from './Icons';
import { ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
  error: <XCircleIcon className="w-6 h-6 text-red-400" />,
  info: <InformationCircleIcon className="w-6 h-6 text-blue-400" />,
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [animationClass, setAnimationClass] = useState('opacity-0 -translate-y-4');

  useEffect(() => {
    // Entrance animation
    requestAnimationFrame(() => {
      setAnimationClass('opacity-100 translate-y-0');
    });

    const autoDismissTimer = setTimeout(() => {
      handleClose();
    }, 3500);

    return () => {
      clearTimeout(autoDismissTimer);
    };
  }, []);

  const handleClose = () => {
    setAnimationClass('opacity-0 translate-y-4');
    setTimeout(() => {
      onClose();
    }, 300); // Match transition duration
  };

  return (
    <div
      className={`w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex items-start p-4 transition-all duration-300 ease-in-out transform ${animationClass}`}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 flex-1 pt-0.5">
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={handleClose}
          className="inline-flex text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;