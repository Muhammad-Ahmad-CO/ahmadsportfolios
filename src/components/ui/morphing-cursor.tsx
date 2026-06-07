"use client";

import { useEffect, useRef, useState } from "react";

export const MorphingCursor = () => {
  const circleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const interactive =
        !!el &&
        !!el.closest(
          'a, button, [role="button"], input, textarea, select, label, .cursor-pointer'
        );
      setHovering(interactive);
    };

    window.addEventListener("mousemove", move);

    let raf = 0;
    const tick = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.18);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.18);
      if (circleRef.current) {
        circleRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={circleRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
        style={{
          width: hovering ? 64 : 36,
          height: hovering ? 64 : 36,
          borderRadius: hovering ? "30% 70% 70% 30% / 30% 30% 70% 70%" : "9999px",
          border: "1.5px solid rgba(215, 226, 234, 0.85)",
          background: hovering
            ? "radial-gradient(circle at 30% 30%, rgba(215,226,234,0.18), rgba(215,226,234,0.04))"
            : "transparent",
          backdropFilter: "invert(1) hue-rotate(180deg)",
          WebkitBackdropFilter: "invert(1) hue-rotate(180deg)",
          mixBlendMode: "difference",
          transition:
            "width 380ms cubic-bezier(.2,.8,.2,1), height 380ms cubic-bezier(.2,.8,.2,1), border-radius 600ms cubic-bezier(.2,.8,.2,1), background 380ms ease",
          animation: hovering ? "morph-blob 4s ease-in-out infinite" : undefined,
        }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block rounded-full"
        style={{
          width: 5,
          height: 5,
          background: "rgba(215, 226, 234, 0.95)",
          mixBlendMode: "difference",
        }}
      />
      <style>{`
        @keyframes morph-blob {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 70% 30% 50% 50% / 50% 60% 40% 50%; }
          50% { border-radius: 50% 50% 30% 70% / 60% 40% 60% 40%; }
          75% { border-radius: 40% 60% 60% 40% / 70% 30% 70% 30%; }
        }
        @media (hover: hover) and (pointer: fine) {
          body { cursor: none; }
          a, button, [role="button"], input, textarea, select, label { cursor: none !important; }
        }
      `}</style>
    </>
  );
};

export default MorphingCursor;
