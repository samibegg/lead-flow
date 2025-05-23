// components/layout/ClientLayout.js
'use client'; 

import React, { useState, useEffect } from 'react'; 
import Header from './Header';
import Footer from './Footer';
// AuthModal is now rendered globally by ModalProvider
// import AuthModal from '@/components/auth/AuthModal'; 
import { ModalProvider } from '@/context/ModalContext'; // Import ModalProvider

export default function ClientLayout({ children }) {
  // AuthModal state and functions are now managed by ModalProvider
  // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState('light'); 

  useEffect(() => {
    let initialTheme = 'light'; 
    if (typeof window !== 'undefined') { 
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        initialTheme = 'dark';
      }
    }
    setTheme(initialTheme);
  }, []); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]); 

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // openAuthModal and closeAuthModal will be provided by ModalContext if needed by Header directly
  // For now, Header will also consume the context for opening the modal.

  return (
    <ModalProvider> {/* Wrap with ModalProvider */}
      <div className="flex flex-col min-h-screen">
        {/* Header will get openAuthModal from context if needed, or ClientLayout can pass it */}
        <Header onToggleTheme={toggleTheme} currentTheme={theme} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
          {children}
        </main>
        <Footer />
        {/* AuthModal is rendered inside ModalProvider */}
      </div>
    </ModalProvider>
  );
}
