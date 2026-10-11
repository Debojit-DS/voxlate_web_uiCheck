"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuthPrompt } from "./AuthPromptProvider";

export function AuthPromptModal() {
  const { isOpen, closePrompt, redirectTo, autoOpen } = useAuthPrompt();

  const buildHref = (path: string) => {
    const params = new URLSearchParams();
    params.set("redirectTo", redirectTo);
    if (autoOpen) params.set("autoOpen", autoOpen);
    return `${path}?${params.toString()}`;
  };

  return (
    <Modal
      open={isOpen}
      onClose={closePrompt}
      size="sm"
      title="Join the Voxlate Waitlist"
      description="Sign in or create an account to join the waitlist and be first in line."
    >
      <div className="space-y-3">
        <Button href={buildHref("/signup")} onClick={closePrompt} className="w-full">
          Create Account
        </Button>
        <Button variant="secondary" href={buildHref("/login")} onClick={closePrompt} className="w-full">
          Log In
        </Button>
      </div>
    </Modal>
  );
}
