"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Digit = ({ value }: { value: number }) => {
  return (
    <div className="relative flex h-[22px] w-[16px] items-center justify-center overflow-hidden rounded-[5px] border border-[#D7E2EA]/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(215,226,234,0.08)] backdrop-blur-sm sm:h-[26px] sm:w-[19px] md:h-[30px] md:w-[22px]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute font-mono font-semibold tabular-nums text-[#D7E2EA]/75"
          style={{ fontSize: "clamp(0.62rem, 1.5vw, 0.9rem)" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default function FlipClock({
  mode = "digital",
  onToggle,
}: {
  mode?: "digital" | "analog";
  onToggle?: () => void;
}) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;


  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const Sep = () => (
    <span
      className="px-[1px] font-mono font-semibold text-[#D7E2EA]/40"
      style={{ fontSize: "clamp(0.55rem, 1.3vw, 0.8rem)" }}
    >
      :
    </span>
  );

  if (mode === "analog") {
    const h = time.getHours() % 12;
    const m = time.getMinutes();
    const sec = time.getSeconds();
    const hand = (angle: number, length: number, width: number, opacity: number) => (
      <line
        x1="50"
        y1="50"
        x2={50 + length * Math.sin((angle * Math.PI) / 180)}
        y2={50 - length * Math.cos((angle * Math.PI) / 180)}
        stroke="#D7E2EA"
        strokeOpacity={opacity}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Switch to digital clock"
        className="clock-toggle rounded-full p-[3px]"
      >
        <span className="clock-toggle-inner flex items-center justify-center rounded-full border border-[rgba(245,245,245,0.35)] p-[2px]">
          <svg viewBox="0 0 100 100" className="h-[54px] w-[54px] sm:h-[62px] sm:w-[62px]">
            <circle cx="50" cy="50" r="47" fill="none" stroke="#D7E2EA" strokeOpacity="0.18" strokeWidth="2" />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={50 + 40 * Math.sin(a)}
                  y1={50 - 40 * Math.cos(a)}
                  x2={50 + 45 * Math.sin(a)}
                  y2={50 - 45 * Math.cos(a)}
                  stroke="#D7E2EA"
                  strokeOpacity={i % 3 === 0 ? 0.6 : 0.25}
                  strokeWidth={i % 3 === 0 ? 3 : 1.5}
                  strokeLinecap="round"
                />
              );
            })}
            {hand(h * 30 + m * 0.5, 22, 4, 0.85)}
            {hand(m * 6 + sec * 0.1, 32, 3, 0.7)}
            {hand(sec * 6, 36, 1.5, 0.5)}
            <circle cx="50" cy="50" r="3" fill="#D7E2EA" fillOpacity="0.8" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Switch to analog clock"
      className="clock-toggle rounded-full p-[3px]"
    >
      <span className="clock-toggle-inner flex items-center gap-[3px] rounded-full border border-[rgba(245,245,245,0.35)] px-2 py-1 sm:gap-1 sm:px-2.5 sm:py-1.5">
        {hours.split("").map((digit, i) => (
          <Digit key={`h-${i}`} value={Number(digit)} />
        ))}
        <Sep />
        {minutes.split("").map((digit, i) => (
          <Digit key={`m-${i}`} value={Number(digit)} />
        ))}
        <Sep />
        {seconds.split("").map((digit, i) => (
          <Digit key={`s-${i}`} value={Number(digit)} />
        ))}
      </span>
    </button>
  );
}
