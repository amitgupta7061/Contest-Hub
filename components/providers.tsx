"use client"

import { SessionProvider } from "next-auth/react"
import { AuthModalProvider } from "@/hooks/use-auth-modal"
import { AuthModal } from "@/components/auth-modal"
import { useAuthModal } from "@/hooks/use-auth-modal"

function AuthModalWrapper() {
  const { isOpen, defaultView, closeAuthModal, onSuccessCallback } = useAuthModal();
  
  return (
    <AuthModal 
      open={isOpen} 
      onOpenChange={(open) => !open && closeAuthModal()} 
      defaultView={defaultView}
      onSuccess={onSuccessCallback || undefined}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        {children}
        <AuthModalWrapper />
      </AuthModalProvider>
    </SessionProvider>
  )
}
