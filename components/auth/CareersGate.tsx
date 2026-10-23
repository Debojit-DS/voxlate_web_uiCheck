"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCareersGate } from "@/components/auth/useCareersGate";

interface CareersGateProps {
  children: React.ReactNode;
}

export function CareersGate({ children }: CareersGateProps) {
  const { status, isAllowed, isLoading, promptJoinWaitlist } = useCareersGate();
  const [showGateMessage, setShowGateMessage] = useState(false);

  useEffect(() => {
    if (status === "blocked") {
      setShowGateMessage(true);
    }
  }, [status]);

  const handleDismissGate = () => {
    setShowGateMessage(false);
  };

  const handleJoinWaitlist = () => {
    promptJoinWaitlist();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6faff] flex items-center justify-center px-6">
        <div className="max-w-[860px] w-full">
          <div className="rounded-2xl border border-[#c5c6d0] bg-white p-8 md:p-12 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0059bb]" />
            <p className="mt-4 text-[#44474f]">Checking waitlist status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-[#f6faff]" style={{ backgroundImage: "radial-gradient(circle at top, rgba(0,89,187,0.04), transparent 40%)" }}>
        <div className="mx-auto max-w-[860px] px-6 py-10 md:py-14">
          <div className="text-center mb-10">
            <span className="inline-block rounded-full bg-[#001b44] px-4 py-1.5 text-xs font-semibold text-white mb-4">
              🚀 We&apos;re Hiring
            </span>
            <h1 className="text-[32px] font-bold text-[#001b44] leading-[40px] tracking-tight mb-3">
              🚀 Voxlate — Careers Application
            </h1>
            <p className="text-[15px] text-[#44474f] leading-relaxed max-w-2xl mx-auto">
              Join our core team shaping the future of real-time voice intelligence and wearable tech.
            </p>
          </div>

          <div className="rounded-2xl border border-[#c5c6d0] bg-white p-8 md:p-10 max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d8e2ff]">
                <svg className="h-8 w-8 text-[#001b44]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0v6v2a6 6 0 0112 0v-1m0-7.5V6a2 2 0 114 0v4.5m-1.5 1.5a2 2 0 004 0v-4.5a2 2 0 10-4 0v4.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#001b44] mb-2">Join the Waitlist First</h2>
              <p className="text-[#44474f] leading-relaxed">
                To apply for a role at Voxlate, you must first join our waitlist. 
                This helps us prioritize candidates who are genuinely excited about our mission.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleJoinWaitlist}
                className="w-full h-12 rounded-md bg-[#001b44] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#002966]"
              >
                Join Waitlist to Continue
              </button>
              <p className="text-center text-xs text-[#44474f]">
                You'll be prompted to sign in or create an account first if you haven't already.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}