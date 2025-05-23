// app/contacts/[id]/edit/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ContactForm from '@/components/contacts/ContactForm'; 
import LoadingSpinner from '@/components/ui/LoadingSpinner'; 
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditContactPage() {
  const params = useParams(); 
  const router = useRouter();
  const contactId = params?.id; 

  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');


  const fetchContact = useCallback(async () => {
    if (!contactId) {
      setIsLoading(false);
      setError("Contact ID is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContact(data);
    } catch (err) {
      console.error("Failed to fetch contact:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleSaveContact = async (formData) => {
    if (!contactId) return;
    setIsSaving(true);
    setSaveMessage('');
    setError(null); 

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save contact');
      }
      setSaveMessage('Contact updated successfully!');
      setContact(result.updatedContact); 
      setTimeout(() => {
        setSaveMessage(''); 
      }, 3000);
    } catch (err) {
      console.error('Failed to save contact:', err);
      setError(err.message); 
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error && !contact) return <p className="text-center text-red-500 dark:text-red-400">Error loading contact: {error}</p>;
  if (!contact) return <p className="text-center text-slate-500 dark:text-slate-400">Contact not found.</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/contacts" className="inline-flex items-center text-primary-light dark:text-primary-dark hover:text-primary-hover-light dark:hover:text-primary-hover-dark mb-6 group text-sm font-medium">
        <ArrowLeft size={18} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
        Back to Contacts
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mb-8">Edit Contact: <span className="text-primary-light dark:text-primary-dark">{contact.first_name} {contact.last_name}</span></h1>
      
      {saveMessage && <p className="mb-6 text-center text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 p-3 rounded-md">{saveMessage}</p>}
      {error && <p className="mb-6 text-center text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md">Error: {error}</p>}

      <ContactForm 
        initialData={contact} 
        onSubmit={handleSaveContact} 
        isSaving={isSaving} 
      />
    </div>
  );
}