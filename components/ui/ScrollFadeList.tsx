"use client";

import { type CSSProperties, type HTMLAttributes, type ReactNode, type Ref, useEffect, useRef } from "react";

type ScrollFadeListProps<TItem> = {
  getKey: (item: TItem) => string;
  items: readonly TItem[];
  renderItem: (item: TItem) => ReactNode;
  className?: string;
  maxFadeHeight?: number;
  scrollClassName?: string;
  scrollStyle?: CSSProperties;
  listProps?: HTMLAttributes<HTMLUListElement>;
  getItemProps?: (item: TItem, index: number) => HTMLAttributes<HTMLLIElement> & { ref?: Ref<HTMLLIElement> };
};

/** The supplied scroll-fade pattern, with semantic hooks for selectable lists. */
export function ScrollFadeList<TItem>({
  className = "relative overflow-hidden rounded-control border border-line bg-surface [--scroll-fade-list-bg:var(--color-surface)]",
  getKey,
  items,
  maxFadeHeight = 76,
  renderItem,
  scrollClassName = "h-80 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]",
  scrollStyle,
  listProps,
  getItemProps,
}: ScrollFadeListProps<TItem>) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frameElement = frameRef.current;
    const scrollElement = scrollRef.current;
    let animationFrame = 0;
    if (!frameElement || !scrollElement) return;

    const updateFadeHeights = () => {
      const maxScrollTop = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
      const distanceFromTop = scrollElement.scrollTop;
      const distanceFromBottom = maxScrollTop - distanceFromTop;
      const fadeLimit = Math.min(Math.max(0, maxFadeHeight), scrollElement.clientHeight / 3);
      frameElement.style.setProperty("--top-fade-height", `${Math.min(fadeLimit, Math.max(0, distanceFromTop))}px`);
      frameElement.style.setProperty("--bottom-fade-height", `${Math.min(fadeLimit, Math.max(0, distanceFromBottom))}px`);
      // Keep fades off the real scrollbar, including on systems with overlay scrollbars.
      frameElement.style.setProperty("--scrollbar-gutter-width", `${scrollElement.offsetWidth - scrollElement.clientWidth}px`);
    };
    const scheduleFadeUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateFadeHeights);
    };
    updateFadeHeights();
    scrollElement.addEventListener("scroll", scheduleFadeUpdate, { passive: true });
    const observer = new ResizeObserver(scheduleFadeUpdate);
    observer.observe(scrollElement);
    if (scrollElement.firstElementChild) observer.observe(scrollElement.firstElementChild);
    return () => {
      cancelAnimationFrame(animationFrame);
      scrollElement.removeEventListener("scroll", scheduleFadeUpdate);
      observer.disconnect();
    };
  }, [maxFadeHeight, items]);

  return (
    <div
      ref={frameRef}
      className={`${className} [--bottom-fade-height:0px] [--top-fade-height:0px] before:pointer-events-none before:absolute before:z-10 before:left-0 before:right-[var(--scrollbar-gutter-width)] before:top-0 before:h-[var(--top-fade-height)] before:bg-linear-to-b before:from-[var(--scroll-fade-list-bg)] before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:z-10 after:bottom-0 after:left-0 after:right-[var(--scrollbar-gutter-width)] after:h-[var(--bottom-fade-height)] after:bg-linear-to-b after:from-transparent after:to-[var(--scroll-fade-list-bg)] after:content-['']`}
    >
      <div className={scrollClassName} ref={scrollRef} style={{ scrollPaddingBlock: Math.max(0, maxFadeHeight), ...scrollStyle }}>
        <ul {...listProps} className={`p-2 ${listProps?.className ?? ""}`}>
          {items.map((item, index) => {
            const props = getItemProps?.(item, index);
            return <li {...props} className={props?.className ?? "rounded-sm px-3 py-2"} key={getKey(item)}>{renderItem(item)}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
