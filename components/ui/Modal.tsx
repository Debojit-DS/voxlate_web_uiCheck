"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

const widths = { sm: "max-w-[420px]", md: "max-w-[520px]", lg: "max-w-[960px]" };

/**
 * Shared overlay built on the native <dialog>: showModal() makes the page inert
 * (focus stays inside), Escape fires `cancel`, and we return focus on close.
 */
export function Modal({ open, onClose, title, description, children, size = "md" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.body.style.overflow = "";
      returnFocus.current?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => {
      if (dialog.open) { dialog.close(); document.body.style.overflow = ""; }
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`modal m-auto w-[calc(100%-32px)] ${widths[size]} max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[8px] border border-line bg-surface p-0 text-ink`}
    >
      {open && (
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[6px] text-slate transition-colors hover:bg-mist hover:text-ink"
            aria-label="Close"
          >
            <X size={18} aria-hidden />
          </button>
          <h2 id={`${id}-title`} className="pr-10 font-display text-[28px] leading-tight text-ink">
            {title}
          </h2>
          {description && (
            <p id={`${id}-desc`} className="mt-2 text-[15px] leading-relaxed text-slate">
              {description}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}
