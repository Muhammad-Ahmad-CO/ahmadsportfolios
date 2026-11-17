import { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  type AvatarController,
  type AvatarProps,
} from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import mascotDefinition from "@/assets/mascot.avatar.json";
import { MASCOT_REACTION_EVENT } from "@/lib/mascot-events";

const definition = mascotDefinition as unknown as AvatarProps["definition"];
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
// How long the mascot box must stay clear of text before the cloud fades
// back in. Hiding is immediate; the delay only guards the reappearance,
// so a fast scroll past text never flickers the mascot.
const SHOW_CLEAR_MS = 200;
// Recollection throttle: glyph rects are cached, but sticky elements,
// transform animations, and CSS marquees move text without any DOM
// mutation, so the cache must also refresh on a clock. A check recollects
// at most every RECOLLECT_MIN_MS, and at least every RECOLLECT_MAX_MS
// while checks keep running (scrolling); a watchdog interval below
// covers the stationary case. Collection costs 1-5ms, so this stays cheap.
const RECOLLECT_MIN_MS = 200;
const RECOLLECT_MAX_MS = 500;
const WATCHDOG_MS = 1000;
const SCROLL_END_MS = 250;

type TextRect = { left: number; top: number; right: number; bottom: number };

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);

// Glyph-accurate text rects in document coordinates: one Range per text
// node, one rect per line fragment. Element boxes are NOT used — full-width
// blocks would hide the mascot even when their glyphs end far left of it.
// Cached by the caller and recollected only when layout may have moved;
// the per-frame check below then only compares rects, so it stays cheap
// and can never oscillate on the mascot's own opacity.
function collectTextRects(mascot: Element): TextRect[] {
  const rects: TextRect[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const visibility = new Map<Element, boolean>();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const text = current.textContent;
    const parent = current.parentElement;
    if (!text || !/\S/.test(text) || !parent) continue;
    if (SKIP_TAGS.has(parent.tagName)) continue;
    if (parent.namespaceURI === "http://www.w3.org/2000/svg") continue;
    if (mascot.contains(current)) continue;
    const range = document.createRange();
    range.selectNodeContents(current);
    const fragments = range.getClientRects();
    if (fragments.length === 0) continue;
    let visible = visibility.get(parent);
    if (visible === undefined) {
      // Computed visibility reflects inheritance, so the immediate parent
      // is enough; opacity-0 subtrees (e.g. dock tooltips) are skipped.
      const style = getComputedStyle(parent);
      visible = style.display !== "none"
        && style.visibility !== "hidden"
        && style.visibility !== "collapse"
        && parseFloat(style.opacity) !== 0;
      visibility.set(parent, visible);
    }
    if (!visible) continue;
    for (const fragment of fragments) {
      if (fragment.width === 0 || fragment.height === 0) continue;
      rects.push({
        left: fragment.left + scrollX,
        top: fragment.top + scrollY,
        right: fragment.right + scrollX,
        bottom: fragment.bottom + scrollY,
      });
    }
  }
  return rects;
}

function textUnderBox(rects: TextRect[], box: TextRect): boolean {
  for (const rect of rects) {
    const overlapX = Math.min(rect.right, box.right) - Math.max(rect.left, box.left);
    if (overlapX <= 1) continue;
    const overlapY = Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top);
    if (overlapY > 1) return true;
  }
  return false;
}

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
  const [textBeneath, setTextBeneath] = useState(false);
  const fadeRef = useRef({
    rects: [] as TextRect[],
    dirty: true,
    lastCollect: 0,
    raf: 0,
    showTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    hidden: false,
    path: "",
  });

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

  // Fade the cloud out while page text sits beneath its fixed box, and
  // back in once the box is clear. The node stays mounted (opacity only),
  // so the fade never shifts layout and the avatar keeps its state.
  // Detection reads cached glyph rects, never hit-testing, so a faded
  // mascot cannot change the detection result. The cache refreshes on
  // DOM/style mutations, scroll-end, and a 1s watchdog, because sticky
  // and animated text moves without any DOM mutation.
  useEffect(() => {
    const mascot = mascotRef.current;
    if (!mascot) return;
    const state = fadeRef.current;
    state.path = window.location.pathname;

    const check = () => {
      state.raf = 0;
      const el = mascotRef.current;
      if (!el) return;
      // SPA navigation swaps the Outlet without remounting the mascot:
      // a changed path means new page content under the same fixed box.
      if (window.location.pathname !== state.path) {
        state.path = window.location.pathname;
        state.dirty = true;
        // New page: force a fresh collection on this check.
        state.lastCollect = 0;
      }
      const now = performance.now();
      const cacheAge = now - state.lastCollect;
      // Recollect when dirty or the cache is stale, throttled so style
      // animation storms (dock hover, entrance motion) cannot force a
      // collection every frame. A throttled skip keeps dirty set, so a
      // later check recollects; the cache it uses meanwhile is <200ms old.
      if ((state.dirty || cacheAge >= RECOLLECT_MAX_MS) && cacheAge >= RECOLLECT_MIN_MS) {
        state.rects = collectTextRects(el);
        state.dirty = false;
        state.lastCollect = now;
      }
      const rect = el.getBoundingClientRect();
      const box: TextRect = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        right: rect.right + window.scrollX,
        bottom: rect.bottom + window.scrollY,
      };
      if (textUnderBox(state.rects, box)) {
        if (state.showTimer !== undefined) {
          clearTimeout(state.showTimer);
          state.showTimer = undefined;
        }
        if (!state.hidden) {
          state.hidden = true;
          setTextBeneath(true);
        }
      } else if (state.hidden && state.showTimer === undefined) {
        state.showTimer = setTimeout(() => {
          state.showTimer = undefined;
          state.hidden = false;
          setTextBeneath(false);
        }, SHOW_CLEAR_MS);
      }
    };
    const schedule = () => {
      if (state.raf === 0) state.raf = requestAnimationFrame(check);
    };
    const markDirty = () => {
      state.dirty = true;
      schedule();
    };

    const observer = new MutationObserver((mutations) => {
      // Ignore mutations inside the mascot itself (avatar animation DOM);
      // anything else may have moved text under the box. Style/class
      // changes are watched too: transform animations move text without
      // touching the DOM tree, and the recollection throttle above keeps
      // animation storms cheap.
      for (const mutation of mutations) {
        if (mutation.target instanceof Node && mascot.contains(mutation.target)) continue;
        markDirty();
        return;
      }
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style", "class"],
      subtree: true,
    });

    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      schedule();
      // Scrolling moves sticky text without DOM mutations; recheck with
      // fresh rects shortly after scrolling stops.
      if (scrollEndTimer !== undefined) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(markDirty, SCROLL_END_MS);
    };
    const onResize = () => markDirty();
    const onPopState = () => markDirty();
    const onVisible = () => { if (!document.hidden) markDirty(); };
    const onLoad = () => markDirty();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("load", onLoad);
    document.fonts.ready.then(markDirty).catch(() => undefined);
    // Settle rechecks catch font swaps and late layout shifts.
    const settle1 = setTimeout(markDirty, 300);
    const settle2 = setTimeout(markDirty, 1200);
    const settle3 = setTimeout(markDirty, 3000);
    // Watchdog: CSS animations (marquees) move text with no DOM mutation
    // and no scroll event; refresh on a clock so the fade never goes
    // stale while the page sits still.
    const watchdog = setInterval(markDirty, WATCHDOG_MS);
    schedule();

    return () => {
      observer.disconnect();
      clearInterval(watchdog);
      if (scrollEndTimer !== undefined) clearTimeout(scrollEndTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("load", onLoad);
      clearTimeout(settle1);
      clearTimeout(settle2);
      clearTimeout(settle3);
      if (state.showTimer !== undefined) {
        clearTimeout(state.showTimer);
        state.showTimer = undefined;
      }
      if (state.raf !== 0) {
        cancelAnimationFrame(state.raf);
        // Reset the flag: without this, a cancelled frame leaves a stale
        // nonzero handle behind and every later schedule() becomes a
        // no-op (StrictMode's mount/unmount/remount in dev hits this).
        state.raf = 0;
      }
    };
  }, []);

  return (
    <div ref={mascotRef} className="portfolio-mascot keep-color" aria-hidden="true"
      data-animation={animation} data-paused={paused} data-text-beneath={textBeneath}>
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