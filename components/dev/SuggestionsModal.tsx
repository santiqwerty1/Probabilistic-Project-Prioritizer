import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/suggestions.md')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(text => {
          setContent(text);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch suggestions:', error);
          setContent('Could not load suggestions.');
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Suggestions for Improvement</h2>
        <div className="prose prose-invert bg-gray-900/50 p-4 rounded-lg max-h-[70vh] overflow-y-auto border border-gray-700">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
          )}
        </div>
         <div className="flex justify-end pt-2">
            <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
            >
            Close
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuggestionsModal;
