import { useCallback, useEffect, useRef, useState } from "react";
import { createAvatar, type AvatarController } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import mascotDefinition from "@/assets/mascot.avatar.json";
import { MASCOT_REACTION_EVENT } from "@/lib/mascot-events";

// Keep the export untouched. Its waking timeline loops with closed eyes;
// finish with neutral eyes, and use documented once playback for reactions.
const MascotAvatar = createAvatar({
  ...mascotDefinition,
  animations: {
    ...mascotDefinition.animations,
    waking: {
      ...mascotDefinition.animations.waking,
      playbackMode: "once",
      steps: [
        ...mascotDefinition.animations.waking.steps,
        { expression: "neutral", holdMs: 300, transitionMs: 500, transition: "smooth" },
      ],
    },
    celebrate: { ...mascotDefinition.animations.celebrate, playbackMode: "once" },
    // This export has no error animation. Confused plus a gentle shake is
    // the closest supplied reaction, without inventing unsupported API keys.
    confused: {
      ...mascotDefinition.animations.confused,
      playbackMode: "once",
      steps: mascotDefinition.animations.confused.steps.map((step) => ({
        ...step, holdMs: 350, transitionMs: 150,
      })),
    },
  },
});

type Animation = "waking" | "idle" | "sleeping" | "confused" | "celebrate";

export default function PortfolioMascot() {
  const avatar = useRef<AvatarController>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const asleep = useRef(false);
  const pending = useRef<Animation | undefined>(undefined);
  const [animation, setAnimation] = useState<Animation>("waking");
  const [paused, setPaused] = useState(false);

  const play = useCallback((next: Animation) => {
    if (document.hidden) {
      pending.current = next;
      return;
    }
    const result = avatar.current?.play(next);
    if (result?.ok) setAnimation(next);
  }, []);

  useEffect(() => {
    const clearSleep = () => clearTimeout(sleepTimer.current);
    const armSleep = () => {
      clearSleep();
      if (document.hidden) return;
      sleepTimer.current = setTimeout(() => {
        asleep.current = true;
        play("sleeping");
      }, 30_000);
    };
    const activity = () => {
      if (document.hidden) return;
      if (asleep.current) {
        asleep.current = false;
        play("waking");
      }
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
        avatar.current?.pause();
      } else {
        const next = pending.current ?? avatar.current?.getState().activeAnimation;
        pending.current = undefined;
        if (next) {
          avatar.current?.play(next);
          if (["waking", "idle", "sleeping", "confused", "celebrate"].includes(next)) {
            setAnimation(next as Animation);
          }
        }
        armSleep();
      }
    };
    if (document.hidden) visibility();
    else armSleep();
    window.addEventListener("pointermove", activity, { passive: true });
    window.addEventListener("pointerdown", activity, { passive: true });
    window.addEventListener("keydown", activity);
    window.addEventListener(MASCOT_REACTION_EVENT, reaction);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearSleep();
      window.removeEventListener("pointermove", activity);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
      window.removeEventListener(MASCOT_REACTION_EVENT, reaction);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [play]);

  const onAnimationEnd = useCallback((key: string) => {
    if (key === "waking" || key === "celebrate" || key === "confused") play("idle");
  }, [play]);

  return (
    <div className="portfolio-mascot keep-color" aria-hidden="true"
      data-animation={animation} data-paused={paused}>
      <div className="portfolio-mascot-motion">
        <MascotAvatar ref={avatar} size="100%" defaultAnimation="waking"
          ariaLabel="Cloudee portfolio mascot" onAnimationEnd={onAnimationEnd} />
      </div>
    </div>
  );
}