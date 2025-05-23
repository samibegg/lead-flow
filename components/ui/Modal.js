// components/ui/Modal.js
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4" 
      onClick={onClose} 
    >
      <div 
        className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center p-5 border-b border-border-light dark:border-border-dark">
          <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">{title || "Modal"}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto"> 
          {children}
        </div>
      </div>
    </div>
  );
}