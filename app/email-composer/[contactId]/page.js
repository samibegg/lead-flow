// app/email-composer/[contactId]/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmailComposer from '@/components/email/EmailComposer'; 

export default function EmailComposerPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params?.contactId;

  const [contact, setContact] = useState(null);
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  const [error, setError] = useState(null);

  const fetchContactDetails = useCallback(async () => {
    if (!contactId) {
      setIsLoadingContact(false);
      setError("Contact ID is missing.");
      return;
    }
    setIsLoadingContact(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch contact details");
      }
      const data = await response.json();
      setContact(data);
    } catch (err) {
      console.error("Error fetching contact details:", err);
      setError(err.message);
    } finally {
      setIsLoadingContact(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchContactDetails();
  }, [fetchContactDetails]);

  if (isLoadingContact) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2 text-text-secondary-light dark:text-text-secondary-dark">Loading contact details...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 p-4">Error: {error}</p>;
  }

  if (!contact) {
    return <p className="text-center text-slate-500 dark:text-slate-400 p-4">Contact not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/contacts" className="inline-flex items-center text-primary-light dark:text-primary-dark hover:text-primary-hover-light dark:hover:text-primary-hover-dark mb-6 group text-sm font-medium">
        <ArrowLeft size={18} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
        Back to Contacts
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Compose Email for <span className="text-primary-light dark:text-primary-dark">{contact.first_name} {contact.last_name}</span>
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">To: {contact.email}</p>
      </header>
      
      <EmailComposer contact={contact} />

    </div>
  );
}
