"use client";

import { useState } from "react";
import { SquarePlay } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

const VIDEO_SRC = "https://player.vimeo.com/video/1231178393?badge=0&autopause=0&player_id=0&app_id=58479&loop=1";

/** Text-style trigger plus the shared modal holding the real tutorial video. */
export function TutorialButton({ label = "Watch the tutorial video" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="underline-link-target inline-flex items-center gap-2 text-[15px] font-semibold text-ink hover:text-primary">
        <SquarePlay size={18} aria-hidden className="text-primary" />
        <span className="underline-link" data-variant="center">{label}</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Voxlate tutorial" size="lg">
        <div className="relative w-full overflow-hidden rounded-[6px] bg-mist" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={VIDEO_SRC}
            allow="fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Voxlate tutorial video"
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <p className="mt-3 text-[13px] text-slate">
          If the video doesn&apos;t load, it may be blocked by your network or browser.{" "}
          <a href="https://vimeo.com/1231178393" target="_blank" rel="noopener noreferrer" className="text-link">
            Open it on Vimeo
          </a>
          .
        </p>
      </Modal>
    </>
  );
}
