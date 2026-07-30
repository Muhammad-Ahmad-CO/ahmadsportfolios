"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface BlastPortraitProps {
  src: string;
  alt?: string;
  rows?: number;
  cols?: number;
  className?: string;
  radius?: string;
}

/**
 * Portrait that "blasts" into shards when the cursor enters and
 * re-assembles when the cursor leaves.
 */
export function BlastPortrait({
  src,
  alt = "",
  rows = 8,
  cols = 6,
  className = "",
  radius = "20px",
}: BlastPortraitProps) {
  const [blasted, setBlasted] = useState(false);

  const tiles = useMemo(() => {
    const list: {
      r: number;
      c: number;
      dx: number;
      dy: number;
      rot: number;
      delay: number;
    }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = (c + 0.5) / cols - 0.5;
        const cy = (r + 0.5) / rows - 0.5;
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
  }, [rows, cols]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius: radius }}
      onMouseEnter={() => setBlasted(true)}
      onMouseLeave={() => setBlasted(false)}
      onTouchStart={() => setBlasted((v) => !v)}
      role="img"
      aria-label={alt}
    >
      {tiles.map(({ r, c, dx, dy, rot, delay }) => (
        <motion.div
          key={`${r}-${c}`}
          className="absolute overflow-hidden will-change-transform"
          style={{
            left: `${(c / cols) * 100}%`,
            top: `${(r / rows) * 100}%`,
            width: `${100 / cols}%`,
            height: `${100 / rows}%`,
          }}
          animate={
            blasted
              ? { x: dx, y: dy, rotate: rot, scale: 0.7, opacity: 0 }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={{
            type: "spring",
            stiffness: blasted ? 130 : 180,
            damping: blasted ? 14 : 20,
            delay: blasted ? delay : delay * 0.6,
          }}
        >
          <div
            className="absolute"
            style={{
              width: `${cols * 100}%`,
              height: `${rows * 100}%`,
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
