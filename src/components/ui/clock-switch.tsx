import type { ComponentType } from "react";
import { Clock } from "lucide-react";

export type ClockMode = "digital" | "analog";

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

function DigitalIcon({ className, strokeWidth = 2.5 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M7 12h.01" />
      <path d="M12 12h.01" />
      <path d="M17 12h.01" />
    </svg>
  );
}

const OPTIONS: { id: ClockMode; label: string; icon: ComponentType<IconProps> }[] = [
  { id: "digital", label: "Digital clock", icon: DigitalIcon },
  { id: "analog", label: "Analog clock", icon: Clock },
];

export function ClockSwitch({
  value,
  onChange,
}: {
  value: ClockMode;
  onChange: (v: ClockMode) => void;
}) {
  const index = OPTIONS.findIndex((o) => o.id === value);

  return (
    <div className="radio-input" role="radiogroup" aria-label="Clock mode">
      <div className="glass">
        <div className="glass-inner">
          <div className="selector">
            <span
              className="ball"
              style={{ transform: `translateX(${index * 34}px)` }}
            />
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
                  className="choice-circle"
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

export default ClockSwitch;
