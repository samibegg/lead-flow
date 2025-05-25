// app/email-composer/[contactId]/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useRouter is not used, can be removed if not needed elsewhere
import Link from 'next/link';
import { ArrowLeft, Clock, User as UserIcon, FileText, Inbox } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmailComposer from '@/components/email/EmailComposer'; 

export default function EmailComposerPage() {
  const params = useParams();
  // const router = useRouter(); // Not currently used, can remove if not needed
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
    // Keep isLoadingContact true if it's not the initial load but a refresh
    // For initial load, it's set outside. For refresh, we just want to update data.
    // However, EmailComposer has its own sending state.
    // This fetch is primarily for loading the page and for refreshing after send.
    if (!contact) setIsLoadingContact(true); // Only show full page loader on initial load

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
  }, [contactId, contact]); // Added contact to dependencies to allow re-fetch logic if needed

  useEffect(() => {
    fetchContactDetails();
  }, [contactId]); // Fetch on initial contactId change. `WorkspaceContactDetails` itself has contactId as dep.

  if (isLoadingContact && !contact) { // Show full page spinner only on initial load
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2 text-text-secondary-light dark:text-text-secondary-dark">Loading contact details...</p>
      </div>
    );
  }

  if (error && !contact) { // Show error if initial load failed
    return <p className="text-center text-red-500 dark:text-red-400 p-4">Error: {error}</p>;
  }

  if (!contact) {
    return <p className="text-center text-slate-500 dark:text-slate-400 p-4">Contact not found.</p>;
  }

  // Sort email history by timestamp, most recent first
  const sortedEmailHistory = contact.email_history 
    ? [...contact.email_history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) 
    : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/contacts" className="inline-flex items-center text-primary-light dark:text-primary-dark hover:text-primary-hover-light dark:hover:text-primary-hover-dark mb-6 group text-sm font-medium">
        <ArrowLeft size={18} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
        Back to Contacts
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Compose Email for <span className="text-primary-light dark:text-primary-dark">{contact.first_name} {contact.last_name}</span>
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">To: {contact.email}</p>
          </header>
          {/* Pass fetchContactDetails as a prop to trigger refresh */}
          <EmailComposer contact={contact} onEmailSent={fetchContactDetails} />
        </div>

        {/* Email History Section */}
        <aside className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="sticky top-24"> 
            <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 pb-3 border-b border-border-light dark:border-border-dark flex items-center">
              <Inbox size={22} className="mr-3 text-primary dark:text-primary-dark" />
              Email History
            </h2>
            {isLoadingContact && sortedEmailHistory.length === 0 && <LoadingSpinner />} {/* Show spinner if loading history */}
            {!isLoadingContact && error && <p className="text-red-500 dark:text-red-400 text-sm">Could not load history: {error}</p>}
            {!isLoadingContact && !error && sortedEmailHistory.length > 0 ? (
              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                {sortedEmailHistory.map((entry, index) => (
                  <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow border border-border-light dark:border-border-dark">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-center">
                        <Clock size={12} className="mr-1.5 opacity-80" />
                        {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                     <h3 className="font-medium text-sm text-text-primary-light dark:text-text-primary-dark truncate" title={entry.subject}>
                        <FileText size={14} className="inline mr-1.5 opacity-70" /> Subject: {entry.subject || '(No Subject)'}
                     </h3>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex items-center mt-1.5">
                      <UserIcon size={12} className="mr-1.5 opacity-70" />
                      From: {entry.sent_from_email}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              !isLoadingContact && !error && <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">No email history found.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}