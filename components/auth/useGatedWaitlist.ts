"use client";

import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

export function useGatedWaitlist() {
  const { user, isLoading, logout } = useAuth();
  const { openModal } = useWaitlistModal();
  const { openPrompt } = useAuthPrompt();

  const openWaitlist = (source?: string) => {
    if (user) {
      openModal(source ?? "navbar");
    } else {
      openPrompt({ redirectTo: window.location.pathname });
    }
  };

  return { openWaitlist, isAuthenticated: !isLoading && !!user, isAuthLoading: isLoading, logout };
}
