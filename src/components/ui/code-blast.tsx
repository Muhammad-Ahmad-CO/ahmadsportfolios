"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code, Terminal, Cpu, Braces, Hash } from "lucide-react";

const COLORS = ["#D7E2EA", "#BBCCD7", "#9CA3AF", "#4ade80", "#60a5fa"];

const TEXT_SYMBOLS = ["</>", "{ }", ";", "#", "01", "()", "/", "/*", "=>"];

function RandomSymbol({ size, color }: { size: number; color: string }) {
  const kind = Math.random();
  const style = { width: size, height: size, color };
  if (kind < 0.2) return <Code style={style} />;
  if (kind < 0.4) return <Terminal style={style} />;
  if (kind < 0.6) return <Cpu style={style} />;
  if (kind < 0.8) return <Braces style={style} />;
  if (kind < 0.9) return <Hash style={style} />;
  const text = TEXT_SYMBOLS[Math.floor(Math.random() * TEXT_SYMBOLS.length)];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize: size * 0.75,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontWeight: 700,
        color,
        lineHeight: 1,
      }}
    >
      {text}
    </span>
  );
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  rotate: number;
}

interface CodeBlastProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
  density?: number;
}

export function CodeBlast({
  children,
  className = "",
  enabled = true,
  density = 90,
}: CodeBlastProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);
  const rectRef = useRef<DOMRect | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawn = useCallback(() => {
    if (!rectRef.current) return;
    const x = mouseRef.current.x;
    const y = mouseRef.current.y;
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 70;
    const size = 10 + Math.random() * 14;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const id = ++idRef.current;
    const particle: Particle = {
      id,
      x,
      y,
      angle,
      distance,
      size,
      color,
      rotate: (Math.random() - 0.5) * 180,
    };
    setParticles((prev) => [...prev.slice(-22), particle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 950);
  }, []);

  const onMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!enabled) return;
    rectRef.current = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rectRef.current.left,
      y: e.clientY - rectRef.current.top,
    };
    if (!intervalRef.current) {
      intervalRef.current = setInterval(spawn, density);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <span
      className={`relative inline-block overflow-visible ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <span
        className="pointer-events-none absolute inset-0 z-50 overflow-visible"
        aria-hidden="true"
      >
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0.85, scale: 0.4, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: 0,
                scale: 1,
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                rotate: p.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
              }}
            >
              <RandomSymbol size={p.size} color={p.color} />
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </span>
  );
}
