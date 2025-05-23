// app/contacts/[id]/edit/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useRouter for navigation after save
import ContactForm from '@/components/contacts/ContactForm'; // Adjust path
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Adjust path
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditContactPage() {
  const params = useParams(); // Gets { id: 'value' }
  const router = useRouter();
  const contactId = params?.id; // Access the id property

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
    setError(null); // Clear previous errors

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
      setContact(result.updatedContact); // Update local state with saved contact
      // Optionally redirect after a delay or show a persistent success message
      setTimeout(() => {
        // router.push('/contacts'); // Or back to the contact detail page if you have one
        setSaveMessage(''); // Clear message after some time
      }, 3000);
    } catch (err) {
      console.error('Failed to save contact:', err);
      setError(err.message); // Display save error
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error && !contact) return <p className="text-center text-red-500">Error loading contact: {error}</p>;
  if (!contact) return <p className="text-center text-gray-500">Contact not found.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/contacts" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group">
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Contacts
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Contact: {contact.first_name} {contact.last_name}</h1>
      
      {saveMessage && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md">{saveMessage}</p>}
      {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">Error: {error}</p>}

      <ContactForm 
        initialData={contact} 
        onSubmit={handleSaveContact} 
        isSaving={isSaving} 
      />
    </div>
  );
}
