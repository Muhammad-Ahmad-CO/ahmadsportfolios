import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface LayeredTextProps {
  /** Lines shown in the resting state. On hover each line rolls up to the next one. */
  lines: string[];
  className?: string;
  /** Tailwind/CSS font-size value applied to every line. */
  fontSize?: string;
  /** Stagger between line animations, in seconds. */
  stagger?: number;
}

/**
 * Layered roll-up text. Each line lives inside an overflow-hidden row, so nothing
 * can ever visually overlap neighbouring sections while animating.
 */
export function LayeredText({
  lines,
  className = "",
  fontSize = "clamp(1.05rem, 2.2vw, 1.75rem)",
  stagger = 0.06,
}: LayeredTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rows = Array.from(container.querySelectorAll<HTMLElement>("[data-layer-track]"));

    const build = () => {
      tlRef.current?.kill();
      gsap.set(rows, { y: 0 });
      if (reduced) return;
      const tl = gsap.timeline({ paused: true });
      rows.forEach((row, i) => {
        const h = row.firstElementChild?.getBoundingClientRect().height ?? 0;
        tl.to(row, { y: -h, duration: 0.7, ease: "power3.out" }, i * stagger);
      });
      tlRef.current = tl;
    };

    build();

    const onEnter = () => tlRef.current?.play();
    const onLeave = () => tlRef.current?.reverse();

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(() => build());
    ro.observe(container);

    return () => {
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
      tlRef.current?.kill();
    };
  }, [lines, stagger]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {lines.map((line, i) => {
        const next = lines[(i + 1) % lines.length];
        return (
          <div key={i} className="relative overflow-hidden">
            <div data-layer-track className="will-change-transform">
              <p
                className="m-0 leading-[1.55] font-medium"
                style={{ fontSize, color: "#D7E2EA" }}
              >
                {line}
              </p>
              <p
                aria-hidden="true"
                className="m-0 leading-[1.55] font-medium"
                style={{ fontSize, color: "#BBCCD7" }}
              >
                {next}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LayeredText;
