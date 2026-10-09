import { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  type AvatarController,
  type AvatarProps,
} from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import mascotDefinition from "@/assets/mascot.avatar.json";
import { MASCOT_REACTION_EVENT } from "@/lib/mascot-events";

const definition = mascotDefinition as AvatarProps["definition"];
type Animation =
  | "idle"
  | "sleeping"
  | "waking"
  | "excited"
  | "celebrate"
  | "confused";
type GazeZone = "near" | "left" | "right" | "above" | "below";

const INTERACTIVE_SELECTOR = "button, a, input";
const WAKE_DURATION_MS = 2_800;

export default function PortfolioMascot() {
  const avatarRef = useRef<AvatarController>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const pointer = useRef({ x: 0, y: 0 });
  const gazeZone = useRef<GazeZone | undefined>(undefined);
  const asleep = useRef(false);
  const [animation, setAnimation] = useState<Animation>("idle");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const play = useCallback((next: Animation) => {
    if (document.hidden || reducedMotion) return;
    const result = avatarRef.current?.play(next);
    if (result?.ok) setAnimation(next);
  }, [reducedMotion]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      avatarRef.current?.stop();
      avatarRef.current?.setExpression("neutral");
      setAnimation("idle");
      setPaused(false);
      return;
    }

    const clearSleep = () => clearTimeout(sleepTimer.current);
    const clearWake = () => clearTimeout(wakeTimer.current);
    const settleAfterWake = () => {
      clearWake();
      wakeTimer.current = setTimeout(() => play("idle"), WAKE_DURATION_MS);
    };
    const armSleep = () => {
      clearSleep();
      if (document.hidden) return;
      sleepTimer.current = setTimeout(() => {
        asleep.current = true;
        play("sleeping");
      }, 30_000);
    };

    const applyGaze = () => {
      frame.current = undefined;
      if (document.hidden || asleep.current) return;
      const rect = mascotRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = pointer.current.x - (rect.left + rect.width / 2);
      const dy = pointer.current.y - (rect.top + rect.height / 2);
      const nearRadius = Math.max(rect.width, rect.height) * 0.85;
      let nextZone: GazeZone;
      if (Math.hypot(dx, dy) <= nearRadius) nextZone = "near";
      else if (Math.abs(dx) >= Math.abs(dy)) nextZone = dx < 0 ? "left" : "right";
      else nextZone = dy < 0 ? "above" : "below";
      if (nextZone === gazeZone.current) return;
      gazeZone.current = nextZone;
      if (nextZone === "near") play("idle");
      else {
        const expressions = {
          left: "curious-left",
          right: "far-right-glance",
          above: "upward-side-glance",
          below: "downward-gaze",
        } as const;
        avatarRef.current?.setExpression(expressions[nextZone]);
      }
    };

    const mousemove = (event: MouseEvent) => {
      if (document.hidden) return;
      pointer.current = { x: event.clientX, y: event.clientY };
      if (asleep.current) {
        asleep.current = false;
        play("waking");
        settleAfterWake();
      }
      armSleep();
      if (frame.current === undefined) frame.current = requestAnimationFrame(applyGaze);
    };

    const pointerover = (event: PointerEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest(INTERACTIVE_SELECTOR)
        : null;
      if (!target) return;
      const previous = event.relatedTarget instanceof Element
        ? event.relatedTarget.closest(INTERACTIVE_SELECTOR)
        : null;
      if (target === previous) return;
      asleep.current = false;
      play("excited");
      armSleep();
    };
    const pointerout = (event: PointerEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest(INTERACTIVE_SELECTOR)
        : null;
      if (!target) return;
      const next = event.relatedTarget instanceof Element
        ? event.relatedTarget.closest(INTERACTIVE_SELECTOR)
        : null;
      if (target === next) return;
      play("idle");
    };
    const click = (event: MouseEvent) => {
      const rect = mascotRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inside = event.clientX >= rect.left && event.clientX <= rect.right
        && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) return;
      asleep.current = false;
      play("celebrate");
      armSleep();
    };
    const reaction = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      if (event.detail !== "error" && event.detail !== "celebrate") return;
      asleep.current = false;
      play(event.detail === "error" ? "confused" : "celebrate");
      armSleep();
    };
    const visibility = () => {
      setPaused(document.hidden);
      if (document.hidden) {
        clearSleep();
        clearWake();
        avatarRef.current?.pause();
      } else {
        asleep.current = false;
        gazeZone.current = undefined;
        play("idle");
        armSleep();
      }
    };

    armSleep();
    window.addEventListener("mousemove", mousemove, { passive: true });
    window.addEventListener("pointerover", pointerover, { passive: true });
    window.addEventListener("pointerout", pointerout, { passive: true });
    window.addEventListener("click", click, { passive: true, capture: true });
    window.addEventListener(MASCOT_REACTION_EVENT, reaction);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearSleep();
      clearWake();
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("pointerover", pointerover);
      window.removeEventListener("pointerout", pointerout);
      window.removeEventListener("click", click, { capture: true });
      window.removeEventListener(MASCOT_REACTION_EVENT, reaction);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [play, reducedMotion]);

  return (
    <div ref={mascotRef} className="portfolio-mascot keep-color" aria-hidden="true"
      data-animation={animation} data-paused={paused}>
      <div className="portfolio-mascot-motion">
        {reducedMotion ? (
          <Avatar ref={avatarRef} definition={definition} size="100%" autoplay={false}
            defaultExpression="neutral" ariaLabel="Cloudee portfolio mascot" />
        ) : (
          <Avatar ref={avatarRef} definition={definition} size="100%"
            defaultAnimation="idle" ariaLabel="Cloudee portfolio mascot" />
        )}
      </div>
    </div>
  );
}