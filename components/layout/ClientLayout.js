// components/layout/ClientLayout.js
'use client'; 

import React, { useState, useEffect } from 'react'; 
import Header from './Header';
import Footer from './Footer';
import AuthModal from '@/components/auth/AuthModal'; 

export default function ClientLayout({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  const openAuthModal = () => {
    console.log("ClientLayout: openAuthModal called, setting isAuthModalOpen to true");
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    console.log("ClientLayout: closeAuthModal called, setting isAuthModalOpen to false");
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    console.log("ClientLayout: isAuthModalOpen state changed to:", isAuthModalOpen);
  }, [isAuthModalOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onLoginSignupClick={openAuthModal} onToggleTheme={toggleTheme} currentTheme={theme} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
        {children}
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}