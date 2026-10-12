"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { checkWaitlistStatus } from "@/lib/waitlistApi";

type DemoGateStatus = "idle" | "loading" | "allowed" | "blocked" | "error";

export function useDemoGate() {
  const [status, setStatus] = useState<DemoGateStatus>("idle");
  const generation = useRef(0);
  const { user } = useAuth();
  const email = user?.email;
  const mounted = useRef(false);
  const { openModal } = useWaitlistModal();
  const { openPrompt } = useAuthPrompt();

  const checkStatus = useCallback(async () => {
    const requestId = ++generation.current;
    if (!email) {
      setStatus("blocked");
      return;
    }

    setStatus("loading");
    try {
      const result = await checkWaitlistStatus(email);
      if (!mounted.current || requestId !== generation.current) return;
      if (result.status === "error") {
        setStatus("error");
      } else if (result.data.joined) {
        setStatus("allowed");
      } else {
        setStatus("blocked");
      }
    } catch {
      if (mounted.current && requestId === generation.current) setStatus("error");
    }
  }, [email]);

  useEffect(() => {
    mounted.current = true;
    const timer = setTimeout(() => void checkStatus(), 0);
    return () => { mounted.current = false; clearTimeout(timer); };
  }, [checkStatus]);

  useEffect(() => {
    const handler = () => {
      checkStatus();
    };
    window.addEventListener("waitlist:joined", handler);
    return () => window.removeEventListener("waitlist:joined", handler);
  }, [checkStatus]);

  const promptJoinWaitlist = useCallback((options?: { redirectTo?: string; autoOpen?: string }) => {
    if (!user) {
      openPrompt(options);
    } else {
      openModal("demo-gate");
    }
  }, [user, openPrompt, openModal]);

  const isAllowed = status === "allowed";

  return {
    status,
    isAllowed,
    isLoading: status === "loading" || status === "idle",
    promptJoinWaitlist,
    refresh: checkStatus,
  };
}
