// components/contacts/ContactForm.js
'use client';

import React, { useState, useEffect } from 'react';
import { Save, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formFields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'organization_name', label: 'Organization Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'address', label: 'Full Address', type: 'text' }, 
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'industry', label: 'Industry', type: 'text' },
  { name: 'sanitized_phone', label: 'Phone', type: 'tel' },
  { name: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
  { name: 'organization_website_url', label: 'Organization Website URL', type: 'url' },
  { name: 'facebook_url', label: 'Facebook URL', type: 'url' }, 
  { name: 'twitter_url', label: 'Twitter URL', type: 'url' },   
  { name: 'headline', label: 'Headline', type: 'textarea' }, 
];


export default function ContactForm({ initialData = {}, onSubmit, isSaving, onCancel }) {
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    const initialFormState = {};
    formFields.forEach(field => {
      initialFormState[field.name] = initialData[field.name] || '';
    });
    setFormData(initialFormState);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back(); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-surface-light dark:bg-surface-dark p-6 sm:p-8 rounded-xl shadow-xl border border-border-light dark:border-border-dark">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {formFields.map(field => (
          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label htmlFor={field.name} className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-shadow"
                required={field.required}
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-shadow"
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border-light dark:border-border-dark">
        <button
          type="button"
          onClick={handleCancelClick}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2.5 border border-border-light dark:border-border-dark text-sm font-medium rounded-md text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
        >
          <XCircle size={18} className="inline mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-primary hover:bg-primary-hover-light dark:bg-primary-dark dark:hover:bg-primary-hover-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
        >
          <Save size={18} className="inline mr-2" />
          {isSaving ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
}
