import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "center" | "comes-in-goes-out" | "goes-out-comes-in";
  direction?: "left" | "right";
  external?: boolean;
  className?: string;
};

/** React port of the UnderlineText reference. Styles live in globals.css (.underline-link). */
export function UnderlineLink({
  href,
  children,
  variant = "center",
  direction = "left",
  external,
  className = "",
}: Props) {
  const classes = `underline-link text-ink hover:text-primary ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} data-variant={variant} data-direction={direction}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} data-variant={variant} data-direction={direction}>
      {children}
    </Link>
  );
}
