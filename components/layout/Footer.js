// components/layout/Footer.js
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-800 text-text-secondary-light dark:text-text-secondary-dark py-8 text-center border-t border-border-light dark:border-border-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm">&copy; {new Date().getFullYear()} Lead Flow. All rights reserved.</p>
      </div>
    </footer>
  );
}
