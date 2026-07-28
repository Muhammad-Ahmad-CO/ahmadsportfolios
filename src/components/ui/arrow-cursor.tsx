"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * ArrowCursor — a classic arrow/pointer cursor that smoothly follows the mouse.
 * Disabled on touch devices (where a custom cursor makes no sense).
 */
export function ArrowCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 45, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 900, damping: 45, mass: 0.35 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = e.target as HTMLElement | null;
      setActive(!!el?.closest("a,button,[role='button'],input,textarea,select,label"));
    };
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.documentElement.classList.add("cursor-none-root");
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("cursor-none-root");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <motion.svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        animate={{ scale: active ? 1.35 : 1, rotate: active ? -12 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.55))" }}
      >
        <path
          d="M4 2 L20 12.5 L12.6 13.6 L16.2 21 L13.2 22.4 L9.7 15 L4 19.6 Z"
          fill="#D7E2EA"
          stroke="#0C0C0C"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}

export default ArrowCursor;
