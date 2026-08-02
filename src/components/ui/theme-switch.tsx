import { Moon, Sun, Eye } from "lucide-react";

export type ThemeMode = "dark" | "light" | "eye";

const OPTIONS: { id: ThemeMode; label: string; icon: typeof Moon }[] = [
  { id: "dark", label: "Dark theme", icon: Moon },
  { id: "light", label: "Light theme", icon: Sun },
  { id: "eye", label: "Eye protection theme", icon: Eye },
];

export function ThemeSwitch({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (v: ThemeMode) => void;
}) {
  const index = OPTIONS.findIndex((o) => o.id === value);

  return (
    <div className="radio-input" role="radiogroup" aria-label="Theme">
      <div className="glass">
        <div className="glass-inner">
          <div className="selector">
            <span className="ball" style={{ transform: `translateX(${index * 34}px)` }} />
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

export default ThemeSwitch;
