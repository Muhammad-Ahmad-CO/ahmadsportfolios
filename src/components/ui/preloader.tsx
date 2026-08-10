import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Braces, Binary, Cpu, Database, GitBranch, Terminal, Code2 } from "lucide-react";

export interface PreloaderProps {
  /** Minimum visible duration on first load, in ms. Default 1800. */
  duration?: number;
  /** Skip the initial preloader entirely (immediate fallback). */
  immediate?: boolean;
  /** Fade-out animation duration in ms. Default 700. */
  fadeDuration?: number;
  /** Debounce for route-change preloader in ms. Default 150. */
  routeDebounce?: number;
  /** Show a brief preloader on every route change. Default true. */
  showOnRouteChange?: boolean;
}

const CODE_ICONS = [Braces, Terminal, Cpu, GitBranch, Database, Binary, Code2];

/**
 * Accessible full-screen preloader.
 * - role="dialog" + aria-modal traps assistive focus context
 * - aria-live announces loading state to screen readers
 * - Locks body scroll while visible
 * - Traps keyboard focus on a hidden sentinel
 * - Shows briefly on route transitions (debounced)
 */
export default function Preloader({
  duration = 1800,
  immediate = false,
  fadeDuration = 700,
  routeDebounce = 150,
  showOnRouteChange = true,
}: PreloaderProps) {
  const [visible, setVisible] = useState(!immediate);
  const [mounted, setMounted] = useState(!immediate);
  const [count, setCount] = useState(100);
  const [iconIndex, setIconIndex] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const isRouteLoading = useRouterState({
    select: (s) => s.status === "pending",
  });

  // Initial load timer
  useEffect(() => {
    if (immediate) return;
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration, immediate]);

  // Countdown 100 -> 000 across the visible duration
  useEffect(() => {
    if (!visible) return;
    setCount(100);
    const step = Math.max(12, Math.floor(duration / 100));
    const id = setInterval(() => {
      setCount((c) => (c <= 0 ? 0 : c - 1));
    }, step);
    return () => clearInterval(id);
  }, [visible, duration]);

  // Cycle the coding element in the letter slot
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setIconIndex((i) => (i + 1) % CODE_ICONS.length);
    }, 260);
    return () => clearInterval(id);
  }, [visible]);

  // Route-change debounced preloader
  useEffect(() => {
    if (!showOnRouteChange) return;
    if (!isRouteLoading) return;
    const t = setTimeout(() => {
      setMounted(true);
      setVisible(true);
    }, routeDebounce);
    return () => {
      clearTimeout(t);
      setVisible(false);
    };
  }, [isRouteLoading, routeDebounce, showOnRouteChange]);

  // Unmount after fade-out
  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), fadeDuration);
    return () => clearTimeout(t);
  }, [visible, fadeDuration]);

  // Body scroll lock + focus management while visible
  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    sentinelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        sentinelRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div role="status" aria-live="polite" className="sr-only">
        Page loaded
      </div>
    );
  }

  const Icon = CODE_ICONS[iconIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading, please wait"
      aria-busy={visible}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0C0C0C]"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: `opacity ${fadeDuration}ms ease`,
      }}
    >
      <div
        ref={sentinelRef}
        tabIndex={0}
        aria-hidden="true"
        className="outline-none"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
      />
      <span role="status" aria-live="assertive" className="sr-only">
        Loading content, please wait.
      </span>

      {/* Wordmark with a rotating coding element in the middle slot */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-[0.06em] select-none"
        style={{
          fontSize: "clamp(3rem, 12vw, 9rem)",
          lineHeight: 1,
          transform: visible ? "translateY(0)" : "translateY(-12px)",
          transition: `transform ${fadeDuration}ms cubic-bezier(0.22,1,0.36,1)`,
        }}
      >
        <span className="font-black uppercase tracking-tight text-[#F2F5F7]">A</span>

        <span
          className="relative inline-flex items-center justify-center"
          style={{ width: "1.05em", height: "1em" }}
        >
          <span
            key={iconIndex}
            className="absolute inset-0 flex items-center justify-center animate-scale-in"
          >
            <Icon
              className="text-[#BBCCD7]"
              strokeWidth={1.5}
              style={{ width: "0.85em", height: "0.85em" }}
            />
          </span>
        </span>

        <span className="font-black uppercase tracking-tight text-[#F2F5F7]">M</span>
        <span className="font-black uppercase tracking-tight text-[#F2F5F7]">E</span>
        <span className="font-black uppercase tracking-tight text-[#F2F5F7]">D</span>
      </div>

      {/* Countdown */}
      <div
        aria-hidden="true"
        className="mt-10 font-medium tracking-[0.35em] text-[#D7E2EA]/70"
        style={{ fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)" }}
      >
        {String(count).padStart(3, "0")}
      </div>
    </div>
  );
}
