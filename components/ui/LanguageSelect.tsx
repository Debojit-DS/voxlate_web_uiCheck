"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { ScrollFadeList } from "./ScrollFadeList";

type Props = {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  icon?: ReactNode;
};

/** Select-only combobox: focus stays on the trigger while arrows explore options. */
export function LanguageSelect({ id, label, value, options, onChange, disabled = false, icon = <Languages size={18} className="text-slate" aria-hidden /> }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [above, setAbove] = useState(false);
  const [listHeight, setListHeight] = useState(288);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const search = useRef({ text: "", time: 0 });
  const expanded = open && !disabled;
  const selectedIndex = Math.max(0, options.indexOf(value));

  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const position = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 16;
      const aboveSpace = rect.top - 96;
      const placeAbove = below < 200 && aboveSpace > below;
      setAbove(placeAbove);
      setListHeight(Math.max(88, Math.min(288, placeAbove ? aboveSpace : below)));
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const option = optionRefs.current[active];
    const scroller = option?.parentElement?.parentElement;
    if (!option || !scroller) return;
    const row = option.getBoundingClientRect();
    const frame = scroller.getBoundingClientRect();
    // Reveal the option inside this list only; never scroll the entire page.
    if (row.top < frame.top + 32) scroller.scrollTop -= frame.top + 32 - row.top;
    else if (row.bottom > frame.bottom - 32) scroller.scrollTop += row.bottom - frame.bottom + 32;
  }, [active, expanded, listHeight]);

  function choose(index: number) {
    if (disabled || !options[index]) return;
    onChange(options[index]);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || !options.length) return;
    const current = expanded ? active : selectedIndex;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        setActive(expanded ? Math.max(0, Math.min(options.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))) : current);
        setOpen(true);
        return;
      }
      case "Home":
      case "End":
        event.preventDefault();
        setActive(event.key === "Home" ? 0 : options.length - 1);
        setOpen(true);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (expanded) choose(active);
        else { setActive(selectedIndex); setOpen(true); }
        return;
      case "Escape":
        if (expanded) { event.preventDefault(); setOpen(false); }
        return;
      case "Tab":
        setOpen(false);
        return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = (now - search.current.time < 700 ? search.current.text : "") + event.key.toLowerCase();
      search.current = { text, time: now };
      // Repeating a letter cycles its matches; a longer prefix finds a language.
      const prefix = [...text].every((char) => char === text[0]) ? text[0] : text;
      for (let offset = 1; offset <= options.length; offset++) {
        const index = (current + offset) % options.length;
        if (options[index].toLowerCase().startsWith(prefix)) {
          setActive(index);
          setOpen(true);
          break;
        }
      }
    }
  }

  return (
    <div ref={root} className="relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <label id={`${id}-label`} htmlFor={id} className="field-label">{label}</label>
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded ? `${listId}-${active}` : undefined}
        disabled={disabled}
        className="field flex items-center justify-between gap-3 text-left"
        onKeyDown={onKeyDown}
        onClick={() => { setActive(selectedIndex); setOpen(!expanded); }}
      >
        <span className="flex items-center gap-3">{icon}<span className="min-w-0 break-words">{value}</span></span>
        <ChevronDown size={16} aria-hidden className={expanded ? "rotate-180 text-primary" : "text-slate"} />
      </button>
      {expanded && (
        <div className={`absolute inset-x-0 z-30 ${above ? "bottom-full mb-2" : "top-full mt-2"}`}>
          <ScrollFadeList
            items={options}
            getKey={(option) => option}
            maxFadeHeight={32}
            scrollClassName="overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
            scrollStyle={{ maxHeight: listHeight }}
            listProps={{ id: listId, role: "listbox", "aria-labelledby": `${id}-label` }}
            getItemProps={(option, index) => ({
              id: `${listId}-${index}`,
              role: "option",
              "aria-selected": option === value,
              ref: (el) => { optionRefs.current[index] = el; },
              className: `flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[3px] px-3 py-2 text-[15px] hover:bg-mist ${index === active ? "bg-mist text-primary outline-1 -outline-offset-1 outline-primary" : "text-ink"}`,
              onMouseDown: (event) => event.preventDefault(),
              onClick: () => choose(index),
            })}
            renderItem={(option) => (
              <>
                <span>{option}</span>
                {option === value && <Check size={16} aria-hidden className="text-primary" />}
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}
