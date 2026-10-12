"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson } from "@/lib/apiClient";

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; use_fedcm_for_prompt?: boolean }) => void;
      prompt: () => void;
    } } };
  }
}

export function useGoogleSignIn(onSuccess?: () => void) {
  const successRef = useRef(onSuccess);
  useEffect(() => { successRef.current = onSuccess; }, [onSuccess]);
  const mounted = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    let attempts = 0;
    const check = () => {
      if (!clientId) { setError("Google sign-in isn't configured. Please use email and password."); return true; }
      if (clientId && window.google?.accounts.id) { setReady(true); return true; }
      return false;
    };
    const timer = setInterval(() => {
      if (check() || ++attempts >= 40) {
        clearInterval(timer);
        if (attempts >= 40) setError("Google sign-in couldn't load. Please use email and password.");
      }
    }, 250);
    const firstCheck = setTimeout(check, 0);
    return () => { mounted.current = false; clearInterval(timer); clearTimeout(firstCheck); };
  }, []);

  const prompt = useCallback(() => {
    const id = window.google?.accounts.id;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!id || !clientId || busy) return;
    setError(null);
    id.initialize({ client_id: clientId, use_fedcm_for_prompt: false, callback: async ({ credential }) => {
      if (!mounted.current) return;
      setBusy(true);
      try {
        const result = await apiJson<{ status: string; message?: string }>("/api/auth/google", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: credential }),
        });
        if (result.status !== "success") throw new Error(result.message || "Google sign-in failed. Please try again.");
        if (mounted.current) { successRef.current?.(); window.location.reload(); }
      } catch (cause) {
        if (mounted.current) setError(cause instanceof Error ? cause.message : "Google sign-in failed. Please try again.");
      } finally { if (mounted.current) setBusy(false); }
    } });
    id.prompt();
  }, [busy]);
  return { prompt, ready, busy, error };
}
