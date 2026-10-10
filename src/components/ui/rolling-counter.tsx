import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:/+!?-&'";
const SCENES = ["AHMAD'S", "PORTFOLIO"];
const FACE_OFFSETS = [-2, -1, 0, 1, 2, 3];
const modulo = (value: number) => ((value % CHARACTERS.length) + CHARACTERS.length) % CHARACTERS.length;
const backOut = (t: number) => 1 + 2.35 * (t - 1) ** 3 + 1.35 * (t - 1) ** 2;

/** Six flat faces project a cylinder without browser-dependent CSS 3D. */
export function RollingCounter() {
  const windowRef = useRef<HTMLDivElement>(null);
  const changeScene = useRef<(direction: number, extraSpin: boolean) => void>(() => {});
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cells = Array.from(windowElement.children) as HTMLElement[];
    const faces = cells.map(cell => Array.from(cell.children) as HTMLElement[]);
    const positions = Array.from({ length: 9 }, () => Math.floor(Math.random() * CHARACTERS.length));
    let height = 0;
    let activeScene = 0;
    let frame = 0;
    let wheelTime = -Infinity;
    let tweens: { from: number; to: number; start: number; duration: number }[] = [];

    const draw = () => {
      const radius = height / (2 * Math.sin(17 * Math.PI / 180));
      positions.forEach((position, drum) => {
        const base = Math.floor(position);
        const fraction = position - base;
        faces[drum]?.forEach((face, index) => {
          const offset = FACE_OFFSETS[index] ?? 0;
          const angle = (offset - fraction) * 34 * Math.PI / 180;
          face.textContent = CHARACTERS[modulo(base + offset)] ?? " ";
          face.style.visibility = Math.abs(angle) >= Math.PI / 2 ? "hidden" : "visible";
          face.style.transform = `translateY(${radius * Math.sin(angle)}px) scaleY(${Math.cos(angle)})`;
        });
      });
    };
    const resize = new ResizeObserver(() => {
      height = Math.max(1, (windowElement.clientWidth - 8) / (9 * 0.74));
      windowElement.style.setProperty("--drum-face-height", `${height}px`);
      draw();
    });
    resize.observe(windowElement);

    const tick = (now: number) => {
      let running = false;
      tweens.forEach((tween, index) => {
        const progress = Math.max(0, Math.min(1, (now - tween.start) / tween.duration));
        positions[index] = tween.from + (tween.to - tween.from) * backOut(progress);
        if (progress < 1) running = true;
      });
      draw();
      if (running) frame = requestAnimationFrame(tick);
    };

    const land = (next: number, turns: number) => {
      cancelAnimationFrame(frame);
      activeScene = (next + SCENES.length) % SCENES.length;
      setScene(activeScene);
      const word = SCENES[activeScene] ?? "";
      const characters = word.padStart(word.length + Math.floor((9 - word.length) / 2), " ").padEnd(9, " ");
      const now = performance.now();
      tweens = positions.map((position, index) => {
        const target = CHARACTERS.indexOf(characters[index] ?? " ");
        const from = position;
        const to = Math.ceil(position) + modulo(target - Math.ceil(position)) + turns * CHARACTERS.length;
        if (media.matches) positions[index] = target;
        return { from, to, start: now + (activeScene % 2 ? 8 - index : index) * 75, duration: Math.min(2200, 600 + 22 * (to - from)) };
      });
      if (media.matches) draw();
      else frame = requestAnimationFrame(tick);
    };
    changeScene.current = (direction, extraSpin) => land(activeScene + direction, extraSpin ? 1 : 0);
    land(0, 2);
    const timer = window.setInterval(() => land(activeScene + 1, 0), 3800);
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!event.deltaY || performance.now() - wheelTime < 650) return;
      wheelTime = performance.now();
      changeScene.current(event.deltaY > 0 ? 1 : -1, false);
    };
    const motionChange = () => land(activeScene, 0);
    const button = windowElement.parentElement;
    button?.addEventListener("wheel", wheel, { passive: false });
    media.addEventListener("change", motionChange);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
      resize.disconnect();
      button?.removeEventListener("wheel", wheel);
      media.removeEventListener("change", motionChange);
      changeScene.current = () => {};
    };
  }, []);

  return (
    <Button variant="ghost" className="rolling-counter" onClick={() => changeScene.current(1, true)} aria-label="Next portfolio counter scene">
      <span className="sr-only" aria-live="polite" aria-atomic="true">{SCENES[scene]}</span>
      <div ref={windowRef} className="rolling-counter-window" aria-hidden="true">
        {Array.from({ length: 9 }, (_, drum) => (
          <div className="rolling-counter-cell" key={drum}>
            {FACE_OFFSETS.map(offset => <span className="rolling-counter-face" key={offset}> </span>)}
          </div>
        ))}
      </div>
    </Button>
  );
}