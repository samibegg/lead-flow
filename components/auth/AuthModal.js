// components/auth/AuthModal.js
'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal'; 
import { signIn } from 'next-auth/react'; 
import { Mail, Key, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const result = await signIn('credentials', {
        redirect: false, 
        email,
        password,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error);
      } else if (result?.ok) {
        onClose(); 
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error("Login error:", err);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed. Please try again.');
      } else {
        
        const loginResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        if (loginResult?.ok) {
          onClose(); 
        } else {
          setError('Signup successful, but auto-login failed. Please login manually.');
        }
      }
    } catch (err) { 
      setError('An unexpected error occurred during signup. Please try again.');
      console.error("Signup error:", err);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    signIn('google'); 
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLoginView ? "Login to Lead Flow" : "Create Account"}>
      <div className="p-6 sm:p-8">
        {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md">{error}</p>}
        {isLoginView ? (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email-login" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input type="email" name="email" id="email-login" required className="w-full pl-10 pr-3 py-2.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Password</label>
               <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input type="password" name="password" id="password-login" required className="w-full pl-10 pr-3 py-2.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover-light dark:bg-primary-dark dark:hover:bg-primary-hover-dark text-white font-semibold py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 disabled:opacity-70">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="name-signup" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Full Name</label>
              <input type="text" name="name" id="name-signup" required className="w-full px-3 py-2.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark" placeholder="Your Name" />
            </div>
            <div>
              <label htmlFor="email-signup" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Email Address</label>
              <input type="email" name="email" id="email-signup" required className="w-full px-3 py-2.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password-signup" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Password</label>
              <input type="password" name="password" id="password-signup" required className="w-full px-3 py-2.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark" placeholder="Create a password" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
          <span className="flex-shrink mx-4 text-text-secondary-light dark:text-text-secondary-dark text-sm">OR</span>
          <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center py-2.5 px-4 border border-border-light dark:border-border-dark rounded-md shadow-sm bg-surface-light dark:bg-slate-700 text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 disabled:opacity-70">
          <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-5 h-5 mr-2"/>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} disabled={loading} className="text-sm text-primary dark:text-primary-dark hover:underline disabled:opacity-70">
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
