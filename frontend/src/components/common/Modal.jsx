import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div
          className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        ></div>

        <div 
          className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 ease-out p-6 sm:p-8"
        >
          <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal