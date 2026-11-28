import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Braces, Binary, Cpu, Database, GitBranch, Terminal, Code2 } from "lucide-react";
import LaunchGateButton from "@/components/ui/launch-gate-button";
import { notifySiteEntered } from "@/lib/mascot-events";

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
 * Accessible full-screen preloader with a Launch gate.
 * - role="dialog" + aria-modal traps assistive focus context
 * - aria-live announces loading state to screen readers
 * - Locks body scroll while visible
 * - Traps keyboard focus on a hidden sentinel
 * - Shows briefly on route transitions (debounced)
 * - Launch gate: when the countdown reaches 000 (loading 100% done),
 *   the wordmark + count fade out on the SAME screen and the 3D LAUNCH
 *   button appears; pressing it fades the whole gate away and opens
 *   the site. The gate only appears on the initial load, never on
 *   route changes.
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
  const [gated, setGated] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const launchButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const isRouteLoading = useRouterState({
    select: (s) => s.status === "pending",
  });

  // Initial load timer: when loading is done, show the Launch gate
  // instead of dismissing the preloader on its own.
  useEffect(() => {
    if (immediate) return;
    const t = setTimeout(() => setGated(true), duration);
    return () => clearTimeout(t);
  }, [duration, immediate]);

  // Countdown 100 -> 000 across the visible duration
  useEffect(() => {
    if (!visible || gated) return;
    setCount(100);
    const step = Math.max(12, Math.floor(duration / 100));
    const id = setInterval(() => {
      setCount((c) => (c <= 0 ? 0 : c - 1));
    }, step);
    return () => clearInterval(id);
  }, [visible, duration, gated]);

  // When the countdown hits 000, loading is 100% done: show the gate.
  useEffect(() => {
    if (count === 0) setGated(true);
  }, [count]);

  // Cycle the coding element in the letter slot
  useEffect(() => {
    if (!visible || gated) return;
    const id = setInterval(() => {
      setIconIndex((i) => (i + 1) % CODE_ICONS.length);
    }, 260);
    return () => clearInterval(id);
  }, [visible, gated]);

  // Route-change debounced preloader (never gated: a route change
  // dismisses on its own, it must not block navigation behind a button).
  useEffect(() => {
    if (!showOnRouteChange) return;
    if (!isRouteLoading) return;
    const t = setTimeout(() => {
      setGated(false);
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

  // Focus the Launch button as soon as the gate appears.
  useEffect(() => {
    if (gated) launchButtonRef.current?.focus();
  }, [gated]);

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
        // While gated, Tab cycles between the sentinel and the Launch
        // button so the button stays reachable by keyboard.
        if (gated) {
          const btn = launchButtonRef.current;
          if (!btn) return;
          if (document.activeElement === btn) sentinelRef.current?.focus();
          else btn.focus();
        } else {
          sentinelRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [mounted, gated]);

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
      aria-label={
        gated ? "Ready. Press Launch to enter the site." : "Loading, please wait"
      }
      aria-busy={!gated && visible}
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
      {/* Full-screen grid behind the Launch button — spans the whole
          gate background, not just the button's neighbourhood. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: gated ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      />
      <span role="status" aria-live="assertive" className="sr-only">
        {gated ? "Loading complete. Press Launch to enter." : "Loading content, please wait."}
      </span>

      {/* Wordmark with a rotating coding element in the middle slot.
          Fades out when the gate appears; the screen itself stays. */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-[0.06em] select-none"
        style={{
          fontSize: "clamp(3rem, 12vw, 9rem)",
          lineHeight: 1,
          opacity: gated ? 0 : 1,
          transform: visible && !gated ? "translateY(0)" : "translateY(-12px)",
          transition: `opacity 400ms ease, transform ${fadeDuration}ms cubic-bezier(0.22,1,0.36,1)`,
          position: gated ? "absolute" : "relative",
          pointerEvents: "none",
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

      {/* Countdown — fades out with the wordmark when the gate appears */}
      <div
        aria-hidden="true"
        className="mt-10 font-medium tracking-[0.35em] text-[#D7E2EA]/70"
        style={{
          fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)",
          opacity: gated ? 0 : 1,
          transition: "opacity 400ms ease",
          position: gated ? "absolute" : "relative",
          pointerEvents: "none",
        }}
      >
        {String(count).padStart(3, "0")}
      </div>

      {/* Launch gate: same screen, same background — only the button
          appears once loading is 100% done. Pressing it opens the site. */}
      {gated && (
        <LaunchGateButton
          ref={launchButtonRef}
          onLaunch={() => {
            setVisible(false);
            notifySiteEntered();
          }}
        />
      )}
    </div>
  );
}
