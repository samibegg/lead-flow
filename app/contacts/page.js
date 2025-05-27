// app/contacts/page.js
'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import ContactList from '@/components/contacts/ContactList'; 
import LoadingSpinner from '@/components/ui/LoadingSpinner'; 
import DisqualifyModal from '@/components/contacts/DisqualifyModal';

export default function ContactsPage() {
  const [contactsData, setContactsData] = useState({
    items: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ 
    searchTerm: '', 
    industry: '', 
    city: '',
    emailStatus: '', 
    disqualificationStatus: '',
    openedEmailStatus: '', // New filter: '', 'opened', 'not_opened_sent'
  }); 
  const itemsPerPage = 25; 

  const [isDisqualifyModalOpen, setIsDisqualifyModalOpen] = useState(false);
  const [contactToDisqualify, setContactToDisqualify] = useState(null);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  const fetchContacts = useCallback(async (page, currentFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== '') { // Ensure empty strings are not sent as filters
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/contacts?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContactsData({
        items: data.contacts,
        totalItems: data.totalContacts,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError(err.message);
      setContactsData({ items: [], totalItems: 0, currentPage: 1, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]); 

  const debouncedFetchContacts = useCallback(debounce(fetchContacts, 500), [fetchContacts]);

  useEffect(() => {
    const activeFilterValues = Object.values(filters).some(value => value && value !== '');
    if (activeFilterValues || currentPage !== 1) { // Fetch if filters active or page changes
        debouncedFetchContacts(currentPage, filters);
    } else {
        fetchContacts(currentPage, filters); // Initial fetch or when filters are cleared
    }
  }, [currentPage, filters, fetchContacts, debouncedFetchContacts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1); 
  };
  
  const onFilterInputChange = (e) => {
    handleFilterChange({ [e.target.name]: e.target.value });
  };

  const openDisqualifyModal = (contact) => {
    setContactToDisqualify(contact);
    setIsDisqualifyModalOpen(true);
  };

  const closeDisqualifyModal = () => {
    setIsDisqualifyModalOpen(false);
    setContactToDisqualify(null);
  };

  const handleDisqualifySubmit = async (disqualificationData) => {
    if (!contactToDisqualify || !contactToDisqualify._id) return;
    try {
      const response = await fetch(`/api/contacts/${contactToDisqualify._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disqualification: disqualificationData }), 
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update disqualification status');
      }
      fetchContacts(currentPage, filters); 
      closeDisqualifyModal();
    } catch (err) {
      console.error('Failed to disqualify contact:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleMarkAsOpened = async (contactToMark) => {
    if (!contactToMark || !contactToMark._id) return;
    try {
      const response = await fetch(`/api/contacts/${contactToMark._id}/mark-opened`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark email as opened');
      }
      // Refresh current page data to reflect the change
      fetchContacts(currentPage, filters); 
      alert(`Email interaction marked as opened for ${contactToMark.first_name}.`);
    } catch (err) {
      console.error("Failed to mark email as opened:", err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Your Contacts</h1>
        <div className="mt-6 p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
          <h3 className="text-xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Filter Contacts</h3>
          {/* Adjusted grid to accommodate more filters, now potentially 2 rows on smaller screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
            <input
              type="text"
              name="searchTerm" 
              value={filters.searchTerm || ''}
              onChange={onFilterInputChange}
              placeholder="Search name, company..."
              className="w-full px-4 py-2.5 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 placeholder-text-secondary-light dark:placeholder-text-secondary-dark text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark transition-shadow"
            />
            <input
              type="text"
              name="industry" 
              value={filters.industry || ''}
              onChange={onFilterInputChange}
              placeholder="Filter by Industry"
              className="w-full px-4 py-2.5 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 placeholder-text-secondary-light dark:placeholder-text-secondary-dark text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark transition-shadow"
            />
            <input
              type="text"
              name="city" 
              value={filters.city || ''}
              onChange={onFilterInputChange}
              placeholder="Filter by City"
              className="w-full px-4 py-2.5 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 placeholder-text-secondary-light dark:placeholder-text-secondary-dark text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark transition-shadow"
            />
            <div className="relative">
              <select
                name="emailStatus"
                value={filters.emailStatus || ''}
                onChange={onFilterInputChange}
                className="w-full px-4 py-2.5 pr-10 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark transition-shadow appearance-none"
              >
                <option value="">All Email Status</option>
                <option value="contacted">Emailed</option>
                <option value="not_contacted">Not Emailed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary-light dark:text-text-secondary-dark">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S5.922 9.581 5.516 9.163c-.409-.418-.436-1.17 0-1.615z"/></svg>
              </div>
            </div>
            <div className="relative"> 
              <select
                name="disqualificationStatus"
                value={filters.disqualificationStatus || ''}
                onChange={onFilterInputChange}
                className="w-full px-4 py-2.5 pr-10 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark transition-shadow appearance-none"
              >
                <option value="">All Qualification</option>
                <option value="qualified">Qualified</option>
                <option value="disqualified">Disqualified</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary-light dark:text-text-secondary-dark">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S5.922 9.581 5.516 9.163c-.409-.418-.436-1.17 0-1.615z"/></svg>
              </div>
            </div>
             {/* New Filter for Opened Email Status */}
            <div className="relative">
              <select
                name="openedEmailStatus"
                value={filters.openedEmailStatus || ''}
                onChange={onFilterInputChange}
                className="w-full px-4 py-2.5 pr-10 border border-border-light dark:border-border-dark bg-white dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark transition-shadow appearance-none"
              >
                <option value="">Any Open Status</option>
                <option value="opened">Email Opened</option>
                <option value="not_opened_sent">Emailed, Not Opened</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary-light dark:text-text-secondary-dark">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S5.922 9.581 5.516 9.163c-.409-.418-.436-1.17 0-1.615z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md">Error: {error}</p>}
      
      {!isLoading && !error && contactsData.items && (
        <ContactList
          contacts={contactsData.items}
          totalItems={contactsData.totalItems}
          currentPage={contactsData.currentPage}
          totalPages={contactsData.totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onDisqualifyClick={openDisqualifyModal}
          onMarkAsOpenedClick={handleMarkAsOpened} 
        />
      )}
       {!isLoading && !error && (!contactsData.items || contactsData.items.length === 0) && (
        <p className="text-center text-text-secondary-light dark:text-text-secondary-dark py-8 text-lg">No contacts found. Try adjusting your filters.</p>
      )}

      {contactToDisqualify && (
        <DisqualifyModal
          isOpen={isDisqualifyModalOpen}
          onClose={closeDisqualifyModal}
          contact={contactToDisqualify}
          onDisqualify={handleDisqualifySubmit}
        />
      )}
    </div>
  );
}