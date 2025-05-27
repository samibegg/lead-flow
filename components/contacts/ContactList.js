// components/contacts/ContactList.js
import React from 'react';
import ContactItem from './ContactItem';

// Add onDisqualifyClick to props
export default function ContactList({ contacts, totalItems, currentPage, totalPages, onPageChange, itemsPerPage, onDisqualifyClick, onMarkAsOpenedClick }) {
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (!contacts || contacts.length === 0) {
    return null; 
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map(contact => (
          <ContactItem 
            key={contact._id || contact.id} 
            contact={contact} 
            onDisqualifyClick={onDisqualifyClick}
            onMarkAsOpenedClick={onMarkAsOpenedClick}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> results
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-primary hover:bg-primary-hover-light dark:bg-primary-dark dark:hover:bg-primary-hover-dark text-black text-sm font-medium rounded-md disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-primary hover:bg-primary-hover-light dark:bg-primary-dark dark:hover:bg-primary-hover-dark text-black text-sm font-medium rounded-md disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}