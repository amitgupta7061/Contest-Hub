'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  defaultView: 'login' | 'register';
  openAuthModal: (view?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  onSuccessCallback: (() => void) | null;
  setOnSuccessCallback: (callback: (() => void) | null) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultView, setDefaultView] = useState<'login' | 'register'>('login');
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  const openAuthModal = (view: 'login' | 'register' = 'login') => {
    setDefaultView(view);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setOnSuccessCallback(null);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        defaultView,
        openAuthModal,
        closeAuthModal,
        onSuccessCallback,
        setOnSuccessCallback,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
