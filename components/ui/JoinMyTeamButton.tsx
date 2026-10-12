import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type JoinMyTeamButtonProps = {
  href?: string;
  className?: string;
};

export function JoinMyTeamButton({
  href = "/careers",
  className = "",
}: JoinMyTeamButtonProps) {
  return (
    <Button
      href={href}
      icon={ArrowRight}
      className={`w-full max-w-full hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:bg-ink active:[&_.ihb-dot]:bg-ink motion-safe:active:translate-y-px motion-reduce:transition-none sm:w-auto ${className}`}
    >
      Join My Team
    </Button>
  );
}
