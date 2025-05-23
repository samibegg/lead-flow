// context/ModalContext.js (New File)
'use client';

import React, { createContext, useContext, useState } from 'react';
import AuthModal from '@/components/auth/AuthModal'; // Assuming AuthModal needs to be controlled globally

const ModalContext = createContext({
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    // console.log("ModalContext: openAuthModal called");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    // console.log("ModalContext: closeAuthModal called");
    setIsAuthModalOpen(false);
  };

  return (
    <ModalContext.Provider value={{ isAuthModalOpen, openAuthModal, closeAuthModal }}>
      {children}
      {/* Render AuthModal globally here, controlled by context state */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </ModalContext.Provider>
  );
};


