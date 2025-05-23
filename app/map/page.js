// app/map/page.js
'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic'; 
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PlusCircle } from 'lucide-react';

const MapView = dynamic(() => import('@/components/ui/MapView'), {
  ssr: false, 
  loading: () => <div className="flex justify-center items-center h-[600px]"><LoadingSpinner /></div>,
});

const MAP_ITEMS_PER_PAGE = 5; 

export default function MapPage() {
  const [contactsForMap, setContactsForMap] = useState([]);
  const [mapCurrentPage, setMapCurrentPage] = useState(1);
  const [mapTotalPages, setMapTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true); 
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
  const [error, setError] = useState(null);
  const [initialCenter, setInitialCenter] = useState(null); 

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialCenter([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.warn("User denied geolocation or error occurred:", err.message);
          setInitialCenter([39.8283, -98.5795]); 
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      setInitialCenter([39.8283, -98.5795]); 
    }
  }, []);


  const fetchMapContacts = useCallback(async (pageToFetch, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/contacts?limit=${MAP_ITEMS_PER_PAGE}&page=${pageToFetch}`); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const locatedContacts = (data.contacts || []).filter(contact => 
        (contact.address) || (contact.city && contact.state) || (contact.coordinates && contact.coordinates.lat && contact.coordinates.lng)
      );
      
      setContactsForMap(prevContacts => append ? [...prevContacts, ...locatedContacts] : locatedContacts);
      setMapTotalPages(data.totalPages);
      setMapCurrentPage(pageToFetch);

    } catch (err) {
      console.error("Failed to fetch contacts for map:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if(initialCenter){ 
        fetchMapContacts(1); 
    }
  }, [fetchMapContacts, initialCenter]);

  const handleLoadMore = () => {
    if (mapCurrentPage < mapTotalPages) {
      fetchMapContacts(mapCurrentPage + 1, true);
    }
  };

  if (!initialCenter && isLoading) { 
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /> <p className="ml-2 text-text-secondary-light dark:text-text-secondary-dark">Determining location...</p></div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">Lead Locations Map</h1>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mt-2">Visualize the geographical distribution of your leads.</p>
      </header>

      {(isLoading && contactsForMap.length === 0) && <div className="flex justify-center items-center h-[600px]"><LoadingSpinner /></div>}
      {error && <p className="text-center text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md">Error: {error}</p>}
      
      {!isLoading && !error && (
        <div style={{ height: '65vh', minHeight: '500px', width: '100%' }} className="rounded-xl shadow-2xl overflow-hidden border-2 border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark mb-6">
          {initialCenter && (contactsForMap.length > 0 || !isLoading) ? ( 
            <MapView contacts={contactsForMap} initialCenter={initialCenter} />
          ) : (
            !isLoading && <div className="flex justify-center items-center h-full">
              <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">No contacts with location data to display on the map.</p>
            </div>
          )}
        </div>
      )}

      {!isLoading && mapCurrentPage < mapTotalPages && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="bg-primary hover:bg-primary-hover-light dark:bg-primary-dark dark:hover:bg-primary-hover-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 flex items-center justify-center mx-auto"
          >
            <PlusCircle size={20} className="mr-2"/>
            {isLoadingMore ? 'Loading More...' : 'Load More Contacts'}
          </button>
        </div>
      )}
    </div>
  );
}
