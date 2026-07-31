"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface BlastPortraitProps {
  src: string;
  alt?: string;
  rows?: number;
  cols?: number;
  className?: string;
  radius?: string;
  /** Controlled blast state. When provided, internal pointer handling is skipped. */
  blasted?: boolean;
}

/**
 * Portrait that "blasts" into shards when the cursor enters (or on tap)
 * and re-assembles when the cursor leaves / it is tapped again.
 */
export function BlastPortrait({
  src,
  alt = "",
  rows = 8,
  cols = 6,
  className = "",
  radius = "20px",
  blasted: controlled,
}: BlastPortraitProps) {
  const [internal, setInternal] = useState(false);
  const blasted = controlled ?? internal;
  const reduceMotion = useReducedMotion();

  // Fewer shards on small / low-end devices for a smoother frame rate.
  const [lowPower, setLowPower] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const cores = navigator.hardwareConcurrency ?? 8;
    const update = () => setLowPower(mql.matches || cores <= 4);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const R = lowPower ? Math.max(4, Math.round(rows / 2)) : rows;
  const C = lowPower ? Math.max(3, Math.round(cols / 2)) : cols;

  const tiles = useMemo(() => {
    const list: {
      r: number;
      c: number;
      dx: number;
      dy: number;
      rot: number;
      delay: number;
    }[] = [];
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const cx = (c + 0.5) / C - 0.5;
        const cy = (r + 0.5) / R - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy) || 0.001;
        const power = 180 + Math.random() * 220;
        list.push({
          r,
          c,
          dx: (cx / dist) * power * (0.6 + Math.random() * 0.8),
          dy: (cy / dist) * power * (0.6 + Math.random() * 0.8) - 40,
          rot: (Math.random() - 0.5) * 160,
          delay: dist * 0.12 + Math.random() * 0.05,
        });
      }
    }
    return list;
  }, [R, C]);

  const pointerProps =
    controlled === undefined
      ? {
          onMouseEnter: () => setInternal(true),
          onMouseLeave: () => setInternal(false),
          onPointerDown: (e: React.PointerEvent) => {
            if (e.pointerType !== "mouse") setInternal((v) => !v);
          },
        }
      : {};

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius: radius, touchAction: "manipulation" }}
      {...pointerProps}
      role="img"
      aria-label={alt}
    >
      {/* Decoded once by the browser, shared by every shard */}
      <img src={src} alt="" aria-hidden className="hidden" decoding="async" />
      {tiles.map(({ r, c, dx, dy, rot, delay }) => (
        <motion.div
          key={`${r}-${c}`}
          className="absolute overflow-hidden"
          style={{
            left: `${(c / C) * 100}%`,
            top: `${(r / R) * 100}%`,
            width: `${100 / C}%`,
            height: `${100 / R}%`,
            willChange: blasted ? "transform, opacity" : "auto",
            backfaceVisibility: "hidden",
          }}
          animate={
            blasted
              ? { x: dx, y: dy, rotate: rot, scale: 0.7, opacity: 0 }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : {
                  type: "spring",
                  stiffness: blasted ? 130 : 180,
                  damping: blasted ? 14 : 20,
                  delay: blasted ? delay : delay * 0.6,
                }
          }
        >
          <div
            className="absolute"
            style={{
              width: `${C * 100}%`,
              height: `${R * 100}%`,
              left: `-${c * 100}%`,
              top: `-${r * 100}%`,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "top center",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
