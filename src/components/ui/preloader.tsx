import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import BoxLoader from "@/components/ui/box-loader";

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
        // Trap focus on the sentinel
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading, please wait"
      aria-busy={visible}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0C0C]"
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
      <BoxLoader />
    </div>
  );
}
