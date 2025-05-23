// app/contacts/page.js
'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import ContactList from '@/components/contacts/ContactList'; 
import LoadingSpinner from '@/components/ui/LoadingSpinner'; 

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
    city: '' 
  }); 
  const itemsPerPage = 10; 

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
        if (value) { 
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
    const activeFilterValues = Object.values(filters).some(value => !!value);
    if (activeFilterValues) {
        debouncedFetchContacts(currentPage, filters);
    } else {
        fetchContacts(currentPage, filters);
    }
  }, [currentPage, filters, fetchContacts, debouncedFetchContacts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); 
  };
  
  const onFilterInputChange = (e) => {
    handleFilterChange({ ...filters, [e.target.name]: e.target.value });
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Your Contacts</h1>
        <div className="mt-6 p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark">
          <h3 className="text-xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">Filter Contacts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <input
              type="text"
              name="searchTerm" 
              value={filters.searchTerm || ''}
              onChange={onFilterInputChange}
              placeholder="Search name, company, email..."
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
          </div>
        </div>
      </header>

      {isLoading && <LoadingSpinner />}
      {error && <p className="text-center text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md">Error: {error}</p>}
      
      {!isLoading && !error && contactsData.items && contactsData.items.length > 0 && (
        <ContactList
          contacts={contactsData.items}
          totalItems={contactsData.totalItems}
          currentPage={contactsData.currentPage}
          totalPages={contactsData.totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      )}
       {!isLoading && !error && (!contactsData.items || contactsData.items.length === 0) && (
        <p className="text-center text-text-secondary-light dark:text-text-secondary-dark py-8 text-lg">No contacts found. Try adjusting your filters.</p>
      )}
    </div>
  );
}