import type { ComponentType } from "react";
import {
  DotMatrixEyeIcon,
  DotMatrixMoonIcon,
  DotMatrixSunIcon,
  type DotMatrixIconProps,
} from "./dot-matrix-icons";

export type ThemeMode = "light" | "dark" | "eye";

const OPTIONS: { id: ThemeMode; label: string; icon: ComponentType<DotMatrixIconProps> }[] = [
  { id: "light", label: "Light theme", icon: DotMatrixSunIcon },
  { id: "dark", label: "Dark theme", icon: DotMatrixMoonIcon },
  { id: "eye", label: "Eye protection theme", icon: DotMatrixEyeIcon },
];

export function ThemeSwitch({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (v: ThemeMode) => void;
}) {
  const index = OPTIONS.findIndex((o) => o.id === value);

  // Mobile sizes (max-sm) shrink the pill so the whole dock fits a ~390px
  // viewport. The trailing `!` is required: the .radio-input rules in
  // styles.css are unlayered, so plain utilities would lose to them.
  // --sw-step is the ball travel per option (circle + gap): 28px on mobile,
  // 34px fallback on desktop, where the 26px circles are unchanged.
  return (
    <div className="radio-input" role="radiogroup" aria-label="Theme">
      <div className="glass max-sm:p-[2px]!">
        <div className="glass-inner max-sm:border-2! max-sm:p-[1px]!">
          <div className="selector max-sm:gap-1.5! max-sm:[--sw-step:28px]">
            <span className="ball max-sm:h-[22px]! max-sm:w-[22px]!" style={{ transform: `translateX(calc(var(--sw-step, 34px) * ${index}))` }} />
            {OPTIONS.map((o) => {
              const Icon = o.icon;
              const active = o.id === value;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={o.label}
                  title={o.label}
                  onClick={() => onChange(o.id)}
                  className="choice-circle max-sm:h-[22px]! max-sm:w-[22px]! max-sm:border-2!"
                >
                  <Icon className="h-3 w-3 relative z-[2]" strokeWidth={2.5} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeSwitch;
