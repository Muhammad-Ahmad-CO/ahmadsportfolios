"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
}

export const Compare = ({
  firstImage = "",
  secondImage = "",
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = (elapsedTime % (autoplayDuration * 2)) / autoplayDuration;
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;
      setSliderXPercent(percentage);
      autoplayRef.current = setTimeout(animate, 16);
    };
    animate();
  }, [autoplay, autoplayDuration]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const handleStart = useCallback(() => {
    if (slideMode === "drag") setIsDragging(true);
  }, [slideMode]);

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") setIsDragging(false);
  }, [slideMode]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)));
        });
      }
    },
    [slideMode, isDragging],
  );

  return (
    <div
      ref={sliderRef}
      className={cn("relative overflow-hidden select-none", className)}
      style={{ cursor: slideMode === "drag" ? "grab" : "col-resize" }}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={() => {
        if (slideMode === "hover") setSliderXPercent(initialSliderPercentage);
        if (slideMode === "drag") setIsDragging(false);
        startAutoplay();
      }}
      onMouseEnter={stopAutoplay}
      onTouchStart={(e) => !autoplay && handleStart()}
      onTouchEnd={() => !autoplay && handleEnd()}
      onTouchMove={(e) => !autoplay && handleMove(e.touches[0].clientX)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          className="absolute top-0 z-30 m-auto h-full w-px bg-gradient-to-b from-transparent via-[#D7E2EA] to-transparent"
          style={{ left: `${sliderXPercent}%`, top: 0, zIndex: 40 }}
          transition={{ duration: 0 }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-full w-6 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D7E2EA]/20 to-transparent opacity-60 blur-sm" />
          {showHandlebar && (
            <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 z-30 flex h-5 w-5 items-center justify-center rounded-md bg-[#D7E2EA] shadow">
              <GripVertical className="h-4 w-4 text-[#0C0C0C]" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none relative z-20 h-full w-full overflow-hidden">
        {firstImage ? (
          <motion.div
            className="absolute inset-0 z-20 h-full w-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
            transition={{ duration: 0 }}
          >
            <img
              alt="first"
              src={firstImage}
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                firstImageClassName,
              )}
              draggable={false}
            />
          </motion.div>
        ) : null}
      </div>

      {secondImage ? (
        <img
          alt="second"
          src={secondImage}
          className={cn(
            "absolute inset-0 z-10 h-full w-full object-cover",
            secondImageClassname,
          )}
          draggable={false}
        />
      ) : null}
    </div>
  );
};
