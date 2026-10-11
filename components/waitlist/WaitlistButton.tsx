"use client";

import { Button } from "@/components/ui/Button";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";

/** Primary "Join the waitlist" action. `source` attributes where the visitor joined. */
export function WaitlistButton({ source, label = "Join the waitlist", wide }: { source: string; label?: string; wide?: boolean }) {
  const { openWaitlist, isAuthLoading } = useGatedWaitlist();
  return (
    <Button onClick={() => openWaitlist(source)} loading={isAuthLoading} wide={wide}>
      {label}
    </Button>
  );
}
