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

export default function FlipClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="flex items-center gap-[3px] rounded-xl border border-white/[0.06] bg-[#0C0C0C]/50 px-2 py-1 backdrop-blur-md sm:gap-1 sm:px-2.5 sm:py-1.5">
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
    </div>
  );
}
