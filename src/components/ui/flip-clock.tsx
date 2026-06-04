"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Digit = ({ value }: { value: number }) => {
  return (
    <div className="relative w-8 h-12 md:w-10 md:h-14 overflow-hidden rounded-md bg-[#0C0C0C]/80 border border-[#D7E2EA]/20 shadow-inner flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute font-mono text-xl md:text-2xl font-bold text-[#D7E2EA] tabular-nums"
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

  return (
    <div className="flex items-center gap-1 md:gap-1.5">
      {hours.split("").map((digit, i) => (
        <Digit key={`h-${i}`} value={Number(digit)} />
      ))}
      <span className="text-[#D7E2EA] font-bold text-xl md:text-2xl px-0.5">:</span>
      {minutes.split("").map((digit, i) => (
        <Digit key={`m-${i}`} value={Number(digit)} />
      ))}
      <span className="text-[#D7E2EA] font-bold text-xl md:text-2xl px-0.5">:</span>
      {seconds.split("").map((digit, i) => (
        <Digit key={`s-${i}`} value={Number(digit)} />
      ))}
    </div>
  );
}
