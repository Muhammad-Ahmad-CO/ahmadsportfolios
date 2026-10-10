import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789█▓▒░<>/{}[]";

/** Real glyphs define wrapping and selection; decorative glyphs never affect layout. */
export function DecodeText({ text, active, delay = 0 }: { text: string; active: boolean; delay?: number }) {
  const root = useRef<HTMLSpanElement>(null);
  const [visual, setVisual] = useState<string[] | null>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const characters = Array.from(root.current.querySelectorAll<HTMLElement>("[data-decode-char]"));
    let frame = 0;
    let lastUpdate = 0;
    let start = 0;
    const lines = new Map<number, number>();
    const positions = new Map<number, number>();
    const deadlines = characters.map((character) => {
      const top = Math.round(character.getBoundingClientRect().top);
      if (!lines.has(top)) lines.set(top, lines.size);
      const position = positions.get(top) ?? 0;
      positions.set(top, position + 1);
      return delay + (lines.get(top) ?? 0) * 150 + position * 40 + 40 + Math.random() * 30;
    });
    const real = Array.from(text);
    const finish = Math.max(...deadlines, 0);
    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      if (elapsed >= finish) {
        setVisual(null);
        return;
      }
      if (now - lastUpdate >= 40) {
        setVisual(real.map((character, index) => /\s/.test(character) || elapsed >= (deadlines[index] ?? 0)
          ? character : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]));
        lastUpdate = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      setVisual(null);
    };
    preference.addEventListener("change", stop);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", stop);
    };
  }, [active, delay, text]);

  let index = 0;
  return (
    <span ref={root} data-decoding={visual !== null}>
      {text.split(/(\s+)/).map((word, wordIndex) => (
        <span key={wordIndex} className={/\s/.test(word) ? "" : "inline-block"}>
          {Array.from(word).map((character) => {
            const characterIndex = index++;
            return (
              <span key={characterIndex} data-decode-char className="relative">
                <span className={visual !== null ? "opacity-0" : ""}>{character}</span>
                {visual !== null && <span aria-hidden="true" className="pointer-events-none absolute inset-0 select-none text-center">{visual[characterIndex]}</span>}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}