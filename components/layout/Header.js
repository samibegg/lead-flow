// components/layout/Header.js
'use client';

import React, { useContext } from 'react'; // Added useContext
import Link from 'next/link';
import { LogIn, Target, Sun, Moon, LogOut } from 'lucide-react'; 
import { useSession, signOut } from 'next-auth/react'; 
import { useModal } from '@/context/ModalContext'; // Import useModal

export default function Header({ onToggleTheme, currentTheme }) { // Removed onLoginSignupClick prop
  const { data: session, status } = useSession(); 
  const { openAuthModal } = useModal(); // Get openAuthModal from context
  const isLoadingSession = status === "loading";

  const handleLoginClick = () => {
    if (openAuthModal) {
        openAuthModal();
    } else {
      console.error("Header: openAuthModal function not available from context.");
    }
  };

  return (
    <header className="bg-white dark:bg-surface-dark shadow-md sticky top-0 z-50 border-b border-border-light dark:border-border-dark">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center text-2xl font-bold text-primary dark:text-primary-dark hover:opacity-80 transition-opacity">
          <Target size={28} className="mr-2"/>
          Lead Flow
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {session && ( 
            <>
              <Link href="/contacts" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium">
                Contacts
              </Link>
              <Link href="/map" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium">
                Map
              </Link>
            </>
          )}
          
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors"
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isLoadingSession ? (
            <div className="w-24 h-9 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md"></div> 
          ) : session ? (
            <div className="flex items-center">
              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md text-sm transition-colors"
              >
                <LogOut size={16} className="mr-1.5" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginClick} // Use the internal handler that uses context
              className="flex items-center bg-primary hover:bg-primary-hover-light dark:bg-primary-dark dark:hover:bg-primary-hover-dark text-black font-semibold py-2 px-4 rounded-md transition-colors text-sm shadow-sm"
            >
              <LogIn size={16} className="mr-1.5" />
              Login / Signup
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
