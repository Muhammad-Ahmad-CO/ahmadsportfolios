import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface DockProps {
  children: ReactNode;
  className?: string;
  magnification?: number;
  distance?: number;
}

interface DockContextValue {
  mouseX: MotionValue<number>;
  magnification: number;
  distance: number;
}

import { createContext, useContext } from "react";
const DockContext = createContext<DockContextValue | null>(null);

export function Dock({
  children,
  className,
  magnification = 56,
  distance = 120,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  return (
    <DockContext.Provider value={{ mouseX, magnification, distance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "mx-auto flex h-12 sm:h-14 md:h-16 items-end gap-1.5 sm:gap-2 md:gap-3 rounded-2xl border border-white/10 bg-black/50 px-2 sm:px-3 md:px-4 pb-1.5 sm:pb-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

interface DockIconProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  label?: string;
}

export function DockIcon({ children, className, onClick, href, label }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useContext(DockContext);
  const mouseX = ctx?.mouseX ?? useMotionValue(Infinity);
  const magnification = ctx?.magnification ?? 56;
  const distance = ctx?.distance ?? 120;

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [32, magnification, 32]
  );
  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  const inner = (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className={cn(
        "flex aspect-square items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#D7E2EA] hover:bg-white/10 transition-colors relative group",
        className
      )}
      onClick={onClick}
    >
      {children}
      {label && (
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {inner}
      </a>
    );
  }
  return inner;
}
