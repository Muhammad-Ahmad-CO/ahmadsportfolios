"use client";

import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Retro AI Chat                                                              */
/*  A first screen for an AI app: one headline and a chat box built like a     */
/*  piece of 80s hardware. You type onto an amber CRT, pick the model with a   */
/*  rotary knob, and press a chunky SEND key that plays a short modem chirp.  */
/*  Suggestion keys type themselves onto the screen.                           */
/* -------------------------------------------------------------------------- */

export interface RetroAiChatInfo {
  /** The model selected on the knob. */
  model: string;
  /** Files added with the ATTACH key. */
  files: File[];
}

/** One turn of the conversation shown on the CRT screen. Portfolio addition. */
export interface RetroChatMessage {
  role: "user" | "ai";
  text: string;
}

export interface RetroAiChatProps {
  /** Main headline above the chat box. */
  headline?: string;
  /** Small status label above the headline. Empty hides it. */
  eyebrow?: string;
  /** Optional line under the headline. */
  subheadline?: string;
  /** Wordmark on the device. */
  brandName?: string;
  /** Model name on the device. */
  modelName?: string;
  /** Prompts the screen types out while it is empty. */
  placeholderPrompts?: string[];
  /** Suggestion keys under the chat box. */
  suggestions?: string[];
  /** Positions on the model knob. */
  models?: string[];
  /** Knob position on mount. */
  defaultModel?: number;
  /** Plastic casing. */
  bodyColor?: string;
  /** CRT glass. */
  screenColor?: string;
  /** Text glow on the screen (amber, green, white...). */
  phosphorColor?: string;
  /** SEND key and lights. */
  accentColor?: string;
  /** Background behind everything. Leave it unset to follow the theme (bg-background); "transparent" drops it. */
  backgroundColor?: string;
  /** Maximum width of the chat box in px. */
  width?: number;
  /** CRT scanlines and flicker. */
  scanlines?: boolean;
  /** Key clicks and the modem chirp. */
  sound?: boolean;
  /** Focus the screen on mount. */
  autoFocus?: boolean;
  /** Called with the message when SEND is pressed. Return a promise to keep the TRANSMIT light on until it settles. */
  onSubmit?: (message: string, info: RetroAiChatInfo) => void | Promise<void>;
  /** Conversation to show on the CRT screen above the input. Portfolio addition. */
  messages?: RetroChatMessage[];
  className?: string;
  /** Rendered under the chat box. */
  children?: React.ReactNode;
}

type RGB = [number, number, number];

/* ------------------------------ colour helpers ----------------------------- */

function parseColor(input: string | undefined, fallback: RGB): RGB {
  if (!input) return fallback;
  const c = input.trim();
  const hex = c.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((x) => x + x).join("");
    if (h.length >= 6) {
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
  }
  const rgb = c.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const p = rgb[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    if (p.length >= 3 && p.slice(0, 3).every((n) => Number.isFinite(n))) return [p[0], p[1], p[2]];
  }
  return fallback;
}

function mixRGB(a: RGB, b: RGB, t: number): RGB {
  const k = Math.min(1, Math.max(0, t));
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k)) as RGB;
}
const css = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;
const mix = (a: RGB, b: RGB, t: number) => css(mixRGB(a, b, t));
const alpha = (a: RGB, o: number) => `rgba(${a[0]},${a[1]},${a[2]},${o})`;
const luma = (c: RGB) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const clamp = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo);

function noiseUri(f: number, seed: number, k: number, b: number, light: boolean, size: number) {
  const c = light ? 1 : 0;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${f}' numOctaves='3' seed='${seed}' stitchTiles='stitch'/>` +
    `<feColorMatrix values='0 0 0 0 ${c} 0 0 0 0 ${c} 0 0 0 0 ${c} ${k} 0 0 0 ${b}'/></filter>` +
    `<rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/%2523/g, "%23")}")`;
}
const SPECKLE = noiseUri(0.85, 4, 0.22, -0.08, false, 180);
const SHEEN = noiseUri(0.9, 7, 0.25, -0.1, true, 180);

const SANS = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* ---------------------------------- sound ---------------------------------- */

type Audio = { ctx: AudioContext; out: GainNode; noise: AudioBuffer };

function burst(a: Audio, t: number, hz: number, q: number, peak: number, dur: number, type: BiquadFilterType = "bandpass") {
  const s = a.ctx.createBufferSource();
  s.buffer = a.noise;
  const f = a.ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = hz;
  f.Q.value = q;
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(a.out);
  s.start(t, Math.random() * 1.5);
  s.stop(t + dur + 0.02);
}

function tone(a: Audio, t: number, f0: number, f1: number, peak: number, dur: number, type: OscillatorType = "sine") {
  const o = a.ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const sfx = {
  key(a: Audio) {
    const t = a.ctx.currentTime;
    burst(a, t, 2400 + Math.random() * 1400, 1.4, 0.16, 0.03);
    tone(a, t, 190, 95, 0.05, 0.04);
  },
  thunk(a: Audio) {
    const t = a.ctx.currentTime;
    burst(a, t, 900, 0.7, 0.3, 0.09, "lowpass");
    tone(a, t, 150, 60, 0.22, 0.14);
  },
  detent(a: Audio) {
    const t = a.ctx.currentTime;
    burst(a, t, 3600, 2, 0.12, 0.018, "highpass");
    tone(a, t, 900, 500, 0.03, 0.02, "square");
  },
  modem(a: Audio, dur: number) {
    const t = a.ctx.currentTime + 0.06;
    const lp = a.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    lp.connect(a.out);
    const o = a.ctx.createOscillator();
    o.type = "square";
    const g = a.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.01);
    g.gain.setValueAtTime(0.035, t + dur - 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(lp);
    // a short handshake, then data
    o.frequency.setValueAtTime(2100, t);
    o.frequency.setValueAtTime(1300, t + 0.12);
    o.frequency.setValueAtTime(2100, t + 0.2);
    const tones = [1070, 1270, 2025, 2225, 1650, 1850];
    for (let x = t + 0.28; x < t + dur; x += 0.03) o.frequency.setValueAtTime(tones[Math.floor(Math.random() * tones.length)], x);
    o.start(t);
    o.stop(t + dur + 0.02);
    burst(a, t + 0.28, 2600, 0.6, 0.02, dur - 0.3);
  },
};

/* --------------------------------- defaults -------------------------------- */

const DEFAULT_PROMPTS = [
  "Draft a launch email for my new app",
  "Explain black holes like I'm twelve",
  "Plan three days in Kyoto on a budget",
  "Find the bug in this React hook",
];
const DEFAULT_SUGGESTIONS = ["Summarize a document", "Write a product brief", "Plan my week", "Brainstorm names"];
const DEFAULT_MODELS = ["Swift", "Clever", "Deep"];

type Phase = "idle" | "sending" | "sent";

/* -------------------------------------------------------------------------- */

export function RetroAiChat({
  headline = "What shall we make today?",
  eyebrow = "AI-1 terminal · online",
  subheadline,
  brandName = "CLEF",
  modelName = "AI-1",
  placeholderPrompts = DEFAULT_PROMPTS,
  suggestions = DEFAULT_SUGGESTIONS,
  models = DEFAULT_MODELS,
  defaultModel = 1,
  bodyColor = "#E6E0D3",
  screenColor = "#17120B",
  phosphorColor = "#FFB23E",
  accentColor = "#E8692C",
  backgroundColor,
  width = 720,
  scanlines = true,
  sound = true,
  autoFocus = false,
  onSubmit,
  messages,
  className,
  children,
}: RetroAiChatProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = `rc${uid}`;

  const body = parseColor(bodyColor, [230, 224, 211]);
  const glass = parseColor(screenColor, [23, 18, 11]);
  const phos = parseColor(phosphorColor, [255, 178, 62]);
  const accent = parseColor(accentColor, [232, 105, 44]);
  const ink: RGB = luma(body) > 140 ? [34, 31, 27] : [244, 240, 232];
  const accentInk = luma(accent) > 165 ? "#1d1b18" : "#fffaf2";
  const keyBase: RGB = mixRGB(body, WHITE, luma(body) > 140 ? 0.35 : 0.12);

  const modelList = models.length ? models.map((m) => String(m).slice(0, 10)) : DEFAULT_MODELS;
  const prompts = placeholderPrompts.filter(Boolean);
  const promptsKey = prompts.join("\u0000");
  const maxW = clamp(width, 320, 1200);
  const brand = (brandName || "").slice(0, 12);
  const model = (modelName || "").slice(0, 10);

  /* ------------------------------- state ------------------------------- */
  const [value, setValue] = React.useState("");
  const [modelIdx, setModelIdx] = React.useState(() => clamp(Math.round(defaultModel), 0, modelList.length - 1));
  const [files, setFiles] = React.useState<File[]>([]);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [sentBytes, setSentBytes] = React.useState(0);
  const [ghost, setGhost] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    setModelIdx((m) => clamp(m, 0, modelList.length - 1));
  }, [modelList.length]);

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const deviceRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<(HTMLSpanElement | null)[]>([]);
  const level = React.useRef(0);
  const raf = React.useRef<number | null>(null);
  const fillTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const audio = React.useRef<Audio | null>(null);
  const live = React.useRef({ sound, onSubmit, reduced });
  live.current = { sound, onSubmit, reduced };

  /* ------------- portfolio addition: conversation on the CRT ------------- */
  const messagesRef = React.useRef<HTMLDivElement>(null);
  const [speakingIdx, setSpeakingIdx] = React.useState<number | null>(null);
  const speak = React.useCallback(
    (text: string, idx: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      if (speakingIdx === idx) {
        synth.cancel();
        setSpeakingIdx(null);
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => setSpeakingIdx((cur) => (cur === idx ? null : cur));
      u.onerror = () => setSpeakingIdx((cur) => (cur === idx ? null : cur));
      setSpeakingIdx(idx);
      synth.speak(u);
    },
    [speakingIdx]
  );
  React.useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  React.useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );

  /* ------------------------------- audio ------------------------------- */
  const play = React.useCallback((name: "key" | "thunk" | "detent" | "modem", dur = 1) => {
    if (!live.current.sound || typeof window === "undefined") return;
    try {
      if (!audio.current) {
        const Ctx =
          window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const ch = noise.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
        const out = ctx.createGain();
        out.gain.value = 0.7;
        out.connect(ctx.destination);
        audio.current = { ctx, out, noise };
      }
      const a = audio.current;
      if (a.ctx.state === "suspended") void a.ctx.resume();
      if (name === "modem") sfx.modem(a, dur);
      else sfx[name](a);
    } catch {
      /* sound is optional */
    }
  }, []);

  /* -------------------------- level meter (VU) ------------------------- */
  const paintBars = React.useCallback(() => {
    const lv = level.current;
    barsRef.current.forEach((el, i) => {
      if (!el) return;
      const on = i < Math.round(lv * barsRef.current.length);
      el.style.opacity = on ? "1" : "0.16";
    });
  }, []);

  const bump = React.useCallback(
    (amt = 0.32) => {
      level.current = Math.min(1, level.current + amt);
      if (live.current.reduced) {
        paintBars();
        return;
      }
      if (raf.current == null && typeof window !== "undefined") {
        const tick = () => {
          level.current *= 0.9;
          if (level.current < 0.02) level.current = 0;
          paintBars();
          raf.current = level.current > 0 ? requestAnimationFrame(tick) : null;
        };
        raf.current = requestAnimationFrame(tick);
      }
    },
    [paintBars]
  );

  /* ---------------------------- lifecycle ---------------------------- */
  React.useEffect(() => {
    const mq = typeof window !== "undefined" ? window.matchMedia?.("(prefers-reduced-motion: reduce)") : null;
    const update = () => setReduced(!!mq?.matches);
    update();
    mq?.addEventListener?.("change", update);
    if (autoFocus) taRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        taRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      mq?.removeEventListener?.("change", update);
      window.removeEventListener("keydown", onKey);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      if (fillTimer.current) clearTimeout(fillTimer.current);
      if (sentTimer.current) clearTimeout(sentTimer.current);
      audio.current?.ctx.close().catch(() => {});
      audio.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = deviceRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setCompact(e.contentRect.width < 540));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the screen types example prompts while it is empty
  const empty = value.length === 0;
  React.useEffect(() => {
    if (!empty || !prompts.length) {
      setGhost("");
      return;
    }
    if (reduced) {
      let i = 0;
      setGhost(prompts[0]);
      const id = setInterval(() => {
        i = (i + 1) % prompts.length;
        setGhost(prompts[i]);
      }, 4000);
      return () => clearInterval(id);
    }
    let i = 0;
    let n = 0;
    let dir = 1;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      const p = prompts[i];
      if (dir === 1) {
        n++;
        setGhost(p.slice(0, n));
        if (n >= p.length) {
          dir = -1;
          t = setTimeout(step, 2000);
          return;
        }
        t = setTimeout(step, 34 + Math.random() * 55);
      } else {
        n = Math.max(0, n - 2);
        setGhost(p.slice(0, n));
        if (n <= 0) {
          dir = 1;
          i = (i + 1) % prompts.length;
          t = setTimeout(step, 380);
          return;
        }
        t = setTimeout(step, 16);
      }
    };
    t = setTimeout(step, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empty, promptsKey, reduced]);

  // the screen grows with the message
  useIsoLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(220, Math.max(compact ? 72 : 84, ta.scrollHeight))}px`;
  }, [value, compact]);

  /* ------------------------------ actions ------------------------------ */
  const focusEnd = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.focus({ preventScroll: true });
    const end = ta.value.length;
    ta.setSelectionRange(end, end);
  };

  const stopFill = () => {
    if (fillTimer.current) clearTimeout(fillTimer.current);
    fillTimer.current = null;
  };

  const typeIn = (text: string) => {
    stopFill();
    if (phase === "sending") return;
    if (live.current.reduced) {
      setValue(text);
      bump(0.6);
      requestAnimationFrame(focusEnd);
      return;
    }
    let n = 0;
    const tick = () => {
      n = Math.min(text.length, n + 2);
      setValue(text.slice(0, n));
      bump(0.18);
      if (n % 6 === 0) play("key");
      if (n < text.length) fillTimer.current = setTimeout(tick, 18);
      else {
        fillTimer.current = null;
        requestAnimationFrame(focusEnd);
      }
    };
    tick();
  };

  const send = async () => {
    const msg = value.trim();
    if (!msg || phase === "sending") return;
    stopFill();
    play("thunk");
    setPhase("sending");
    const dur = live.current.reduced ? 0 : 1.1;
    if (dur) play("modem", dur);
    const attached = files;
    try {
      await Promise.all([
        Promise.resolve(live.current.onSubmit?.(msg, { model: modelList[modelIdx], files: attached })),
        new Promise((r) => setTimeout(r, dur * 1000)),
      ]);
    } catch {
      /* the caller handles its own errors */
    }
    setSentBytes(new Blob([msg]).size);
    setValue("");
    setFiles([]);
    setPhase("sent");
    if (sentTimer.current) clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => setPhase("idle"), 2400);
  };

  const setModel = (i: number) => {
    const n = modelList.length;
    const next = ((i % n) + n) % n;
    if (next === modelIdx) return;
    setModelIdx(next);
    play("detent");
    bump(0.4);
  };

  /* ------------------------------ knob drag ---------------------------- */
  const drag = React.useRef<{ x: number; y: number; acc: number; moved: boolean; start: number } | null>(null);
  const onKnobDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, acc: 0, moved: false, start: modelIdx };
  };
  const onKnobMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const delta = e.clientX - d.x - (e.clientY - d.y);
    d.x = e.clientX;
    d.y = e.clientY;
    d.acc += delta;
    if (Math.abs(d.acc) > 4) d.moved = true;
    const steps = Math.trunc(d.acc / 28);
    if (steps !== 0) {
      d.acc -= steps * 28;
      setModelIdx((m) => {
        const next = clamp(m + steps, 0, modelList.length - 1);
        if (next !== m) {
          play("detent");
          bump(0.4);
        }
        return next;
      });
    }
  };
  const onKnobUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) setModel(modelIdx + 1);
  };
  const onKnobKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") setModel(Math.min(modelList.length - 1, modelIdx + 1));
    else if (k === "ArrowLeft" || k === "ArrowDown") setModel(Math.max(0, modelIdx - 1));
    else if (k === "Home") setModel(0);
    else if (k === "End") setModel(modelList.length - 1);
    else if (k === " " || k === "Enter") setModel(modelIdx + 1);
    else return;
    e.preventDefault();
  };

  /* ------------------------------ styling ------------------------------ */
  const inkCss = css(ink);
  const engraved: React.CSSProperties = {
    font: `700 9px/1 ${MONO}`,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: alpha(ink, 0.52),
    textShadow: luma(body) > 140 ? "0 1px 0 rgba(255,255,255,.6)" : "0 -1px 0 rgba(0,0,0,.5)",
    whiteSpace: "nowrap",
  };
  const glow = `0 0 1px ${alpha(phos, 0.9)}, 0 0 8px ${alpha(phos, 0.55)}, 0 0 18px ${alpha(phos, 0.2)}`;

  const keyLook = (base: RGB, radius = 10): React.CSSProperties & Record<string, string | number> => {
    const skirt = mix(base, BLACK, 0.34);
    return {
      borderRadius: radius,
      background: `linear-gradient(180deg, ${mix(base, WHITE, 0.4)} 0%, ${css(base)} 46%, ${mix(base, BLACK, 0.07)} 100%)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.7), inset 0 -2px 0 ${alpha(mixRGB(base, BLACK, 0.3), 0.4)}, 0 4px 0 ${skirt}, 0 5px 0 rgba(0,0,0,.22), 0 11px 16px -5px rgba(0,0,0,.4)`,
      "--kp": `inset 0 1px 0 rgba(255,255,255,.45), inset 0 -1px 0 ${alpha(mixRGB(base, BLACK, 0.3), 0.4)}, 0 1px 0 ${skirt}, 0 2px 0 rgba(0,0,0,.2), 0 3px 6px -2px rgba(0,0,0,.35)`,
    };
  };

  const hasText = value.trim().length > 0;
  const statusText =
    phase === "sending" ? "TRANSMIT" : phase === "sent" ? "SENT ✓" : hasText ? `INPUT ${String(value.length).padStart(3, "0")}` : "READY";
  const screenHeader =
    phase === "sending"
      ? "CONNECTING · TRANSMITTING…"
      : phase === "sent"
        ? `TRANSMISSION OK · ${sentBytes} BYTES`
        : `${brand}${brand && model ? " " : ""}${model} · ${modelList[modelIdx].toUpperCase()} · READY.`;

  const anim = (delay: number): React.CSSProperties =>
    reduced ? {} : { animation: `${c}-in .7s cubic-bezier(.2,.7,.2,1) ${delay}s both` };

  const knobAngle = modelList.length > 1 ? -60 + (120 * modelIdx) / (modelList.length - 1) : 0;

  return (
    <section
      data-phase={phase}
      // Portfolio theme: the pasted "text-foreground" class resolves to the
      // light-theme (dark) foreground on this dark site, so the headline and
      // labels were unreadable on the black backdrop. Hardcode the site text
      // colour instead; everything below inherits it via currentColor.
      className={["relative w-full overflow-hidden", backgroundColor ? "" : "bg-background", className]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: backgroundColor || undefined,
        color: "#D7E2EA",
        position: "relative",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: compact ? "56px 16px" : "80px 24px",
        boxSizing: "border-box",
        fontFamily: SANS,
      }}
    >
      <style>{`
.${c}-key{appearance:none;-webkit-appearance:none;border:0;margin:0;cursor:pointer;position:relative;transition:transform .07s ease-out,box-shadow .07s ease-out,filter .2s;-webkit-tap-highlight-color:transparent}
.${c}-key:hover:not(:disabled){filter:brightness(1.03)}
.${c}-key:active:not(:disabled),.${c}-key[data-down="true"]{transform:translateY(3px);box-shadow:var(--kp)!important}
.${c}-key:disabled{cursor:default}
.${c}-f:focus-visible{outline:2px solid ${alpha(accent, 1)};outline-offset:3px}
.${c}-ta{caret-color:${alpha(phos, 1)};caret-shape:block}
.${c}-ta::placeholder{color:transparent;text-shadow:none;opacity:0}
.${c}-ta::selection{background:${alpha(phos, 0.85)};color:${css(glass)};text-shadow:none}
.${c}-x{appearance:none;border:0;background:transparent;color:inherit;cursor:pointer;padding:0 2px;font:inherit}
.${c}-x:focus-visible{outline:1px solid ${alpha(phos, 1)}}
@keyframes ${c}-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes ${c}-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ${c}-flicker{0%,100%{opacity:.94}47%{opacity:1}50%{opacity:.9}53%{opacity:1}}
@keyframes ${c}-roll{from{transform:translateY(-30%)}to{transform:translateY(130%)}}
@keyframes ${c}-prog{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes ${c}-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.${c}-m{animation:none!important}}
`}</style>

      {/* engineering-paper dot grid */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(color-mix(in oklab, currentColor 14%, transparent) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "center",
          WebkitMaskImage: "radial-gradient(ellipse 70% 65% at 50% 45%, #000 20%, transparent 75%)",
          maskImage: "radial-gradient(ellipse 70% 65% at 50% 45%, #000 20%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: maxW,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* ------------------------------ heading ------------------------------ */}
        {eyebrow ? (
          <div
            style={{
              ...anim(0),
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px 6px 10px",
              borderRadius: 999,
              border: "1px solid color-mix(in oklab, currentColor 16%, transparent)",
              background: "color-mix(in oklab, currentColor 4%, transparent)",
              font: `600 11px/1 ${MONO}`,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "color-mix(in oklab, currentColor 72%, transparent)",
              marginBottom: 22,
            }}
          >
            <span
              aria-hidden="true"
              className={`${c}-m`}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: alpha(accent, 1),
                boxShadow: `0 0 0 3px ${alpha(accent, 0.18)}, 0 0 8px ${alpha(accent, 0.8)}`,
                animation: reduced ? "none" : `${c}-pulse 2.2s ease-in-out infinite`,
              }}
            />
            {eyebrow.slice(0, 48)}
          </div>
        ) : null}

        <h1
          style={{
            ...anim(0.06),
            margin: 0,
            textAlign: "center",
            font: `650 ${compact ? "clamp(2rem, 9vw, 2.6rem)" : "clamp(2.4rem, 5.6vw, 4.4rem)"}/1.02 ${SANS}`,
            letterSpacing: "-0.035em",
            textWrap: "balance" as React.CSSProperties["textWrap"],
            maxWidth: "15ch",
          }}
        >
          {headline}
        </h1>
        {subheadline ? (
          <p
            style={{
              ...anim(0.1),
              margin: "16px 0 0",
              maxWidth: "46ch",
              textAlign: "center",
              font: `400 ${compact ? 15 : 17}px/1.55 ${SANS}`,
              color: "color-mix(in oklab, currentColor 62%, transparent)",
              textWrap: "pretty" as React.CSSProperties["textWrap"],
            }}
          >
            {subheadline}
          </p>
        ) : null}

        {/* ------------------------------ device ------------------------------ */}
        <div
          ref={deviceRef}
          style={{
            ...anim(0.14),
            position: "relative",
            width: "100%",
            marginTop: compact ? 32 : 44,
            borderRadius: compact ? 18 : 24,
            padding: compact ? "14px 14px 18px" : "18px 22px 24px",
            boxSizing: "border-box",
            color: inkCss,
            background: `${SPECKLE}, ${SHEEN}, linear-gradient(180deg, ${mix(body, WHITE, 0.28)} 0%, ${css(body)} 22%, ${mix(body, BLACK, 0.06)} 100%)`,
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,.75)",
              `inset 0 -3px 0 ${alpha(mixRGB(body, BLACK, 0.3), 0.3)}`,
              `0 1px 0 ${mix(body, BLACK, 0.2)}`,
              `0 2px 0 ${mix(body, BLACK, 0.26)}`,
              `0 3px 0 ${mix(body, BLACK, 0.3)}`,
              `0 4px 0 ${mix(body, BLACK, 0.34)}`,
              `0 5px 0 ${mix(body, BLACK, 0.38)}`,
              "0 6px 0 rgba(0,0,0,.18)",
              "0 34px 60px -22px rgba(0,0,0,.5)",
              "0 14px 24px -12px rgba(0,0,0,.28)",
            ].join(", "),
          }}
        >
          {/* screws */}
          {[
            { left: 9, top: 9 },
            { right: 9, top: 9 },
            { left: 9, bottom: 11 },
            { right: 9, bottom: 11 },
          ].map((pos, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                position: "absolute",
                ...pos,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${mix(body, WHITE, 0.6)}, ${mix(body, BLACK, 0.25)} 70%)`,
                boxShadow: `inset 0 0 0 0.5px ${alpha(BLACK, 0.3)}, 0 1px 0 rgba(255,255,255,.6)`,
                display: compact ? "none" : "block",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 1,
                  right: 1,
                  top: 3,
                  height: 1,
                  background: alpha(BLACK, 0.4),
                  transform: `rotate(${[20, -35, 70, 5][i]}deg)`,
                }}
              />
            </span>
          ))}

          {/* top strip: brand, status display, speaker */}
          <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 16, marginBottom: compact ? 12 : 14, padding: "0 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ width: 16, height: 3, borderRadius: 1, background: alpha(accent, 1) }} />
                <span style={{ width: 16, height: 3, borderRadius: 1, background: mix(accent, BLACK, 0.35) }} />
              </div>
              <span style={{ font: `900 ${compact ? 14 : 16}px/1 ${SANS}`, letterSpacing: "-0.02em", color: inkCss }}>{brand}</span>
              {model ? (
                <span
                  style={{
                    ...engraved,
                    color: alpha(ink, 0.7),
                    padding: "3px 5px",
                    border: `1px solid ${alpha(ink, 0.28)}`,
                    borderRadius: 3,
                  }}
                >
                  {model}
                </span>
              ) : null}
            </div>

            {/* status display */}
            <div
              role="status"
              aria-live="polite"
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 26,
                padding: "0 10px",
                borderRadius: 6,
                background: `linear-gradient(180deg, ${mix(glass, BLACK, 0.3)}, ${css(glass)})`,
                boxShadow: `inset 0 1px 3px rgba(0,0,0,.8), 0 1px 0 rgba(255,255,255,.6)`,
                font: `600 11px/1 ${MONO}`,
                letterSpacing: "0.14em",
                color: alpha(phos, 1),
                textShadow: glow,
                minWidth: compact ? 0 : 196,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span style={{ minWidth: compact ? 62 : 84, whiteSpace: "nowrap" }}>{statusText}</span>
              <span aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12 }}>
                {Array.from({ length: compact ? 6 : 10 }, (_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      barsRef.current[i] = el;
                    }}
                    style={{
                      width: 3,
                      height: 4 + i * (compact ? 1.4 : 0.8),
                      borderRadius: 0.5,
                      background: i >= (compact ? 5 : 8) ? alpha(accent, 1) : alpha(phos, 1),
                      boxShadow: `0 0 4px ${alpha(phos, 0.6)}`,
                      opacity: 0.16,
                    }}
                  />
                ))}
              </span>
              {phase === "sending" ? (
                <span
                  aria-hidden="true"
                  className={`${c}-m`}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    background: alpha(phos, 1),
                    boxShadow: `0 0 6px ${alpha(phos, 0.9)}`,
                    transformOrigin: "0 50%",
                    animation: reduced ? "none" : `${c}-prog 1.1s linear both`,
                  }}
                />
              ) : null}
              <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                {phase === "sent" ? "Message sent" : ""}
              </span>
            </div>

            {/* speaker grille and power light */}
            {!compact ? (
              <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 44,
                    height: 22,
                    backgroundImage: `radial-gradient(circle, ${mix(body, BLACK, 0.55)} 1.3px, transparent 1.7px)`,
                    backgroundSize: "6px 6px",
                    backgroundPosition: "1px 1px",
                    opacity: 0.85,
                  }}
                />
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: phase === "sending" ? alpha(phos, 1) : "#5BD46A",
                    boxShadow: phase === "sending" ? `0 0 8px ${alpha(phos, 0.9)}` : "0 0 7px rgba(91,212,106,.9), inset 0 -1px 1px rgba(0,0,0,.25)",
                  }}
                />
              </div>
            ) : null}
          </div>

          {/* ---------------------------- CRT screen ---------------------------- */}
          <div
            style={{
              padding: compact ? 8 : 10,
              borderRadius: compact ? 12 : 16,
              background: `linear-gradient(180deg, ${mix(body, BLACK, 0.72)}, ${mix(body, BLACK, 0.82)})`,
              boxShadow: `inset 0 2px 5px rgba(0,0,0,.65), inset 0 -1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.7), 0 -1px 0 ${alpha(mixRGB(body, BLACK, 0.3), 0.5)}`,
            }}
          >
            <div
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                  focusEnd();
                }
              }}
              style={{
                position: "relative",
                borderRadius: compact ? 8 : 11,
                overflow: "hidden",
                padding: compact ? "12px 14px 14px" : "16px 20px 18px",
                background: `radial-gradient(ellipse 120% 90% at 50% 40%, ${mix(glass, phos, 0.06)} 0%, ${css(glass)} 60%, ${mix(glass, BLACK, 0.45)} 100%)`,
                boxShadow: `inset 0 0 0 1px rgba(0,0,0,.7), inset 0 0 50px rgba(0,0,0,.7), inset 0 0 14px ${alpha(phos, 0.06)}`,
                color: alpha(phos, 1),
                textShadow: glow,
                cursor: "text",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  font: `500 11px/1 ${MONO}`,
                  letterSpacing: "0.12em",
                  opacity: 0.55,
                  marginBottom: compact ? 10 : 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  pointerEvents: "none",
                }}
              >
                {screenHeader}
              </div>

              {/* portfolio addition: conversation history on the screen */}
              {messages && messages.length > 0 ? (
                <div
                  ref={messagesRef}
                  role="log"
                  aria-label="Conversation"
                  style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    marginBottom: compact ? 10 : 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    scrollbarWidth: "thin",
                    scrollbarColor: `${alpha(phos, 0.4)} transparent`,
                  }}
                >
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        font: `500 ${compact ? 14 : 15}px/1.55 ${MONO}`,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        opacity: m.role === "user" ? 0.85 : 1,
                      }}
                    >
                      <span style={{ opacity: 0.6 }}>{m.role === "user" ? "YOU › " : "AI-1 › "}</span>
                      {m.text}
                      {m.role === "ai" ? (
                        <button
                          type="button"
                          className={`${c}-x`}
                          aria-label={speakingIdx === i ? "Stop reading aloud" : "Read this answer aloud"}
                          onClick={() => speak(m.text, i)}
                          style={{ marginLeft: 8, verticalAlign: "middle", color: alpha(phos, 0.9), cursor: "pointer" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                            {speakingIdx === i ? (
                              <>
                                <line x1="23" y1="9" x2="17" y2="15" />
                                <line x1="17" y1="9" x2="23" y2="15" />
                              </>
                            ) : (
                              <>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                              </>
                            )}
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span aria-hidden="true" style={{ font: `600 ${compact ? 16 : 18}px/1.5 ${MONO}`, opacity: 0.85, pointerEvents: "none" }}>
                  &gt;
                </span>
                <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                  {empty && ghost !== undefined ? (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        font: `500 ${compact ? 16 : 18}px/1.5 ${MONO}`,
                        opacity: 0.4,
                        pointerEvents: "none",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {ghost}
                      {!focused ? (
                        <span
                          className={`${c}-m`}
                          style={{
                            display: "inline-block",
                            width: "0.6em",
                            height: "1.1em",
                            marginLeft: 2,
                            verticalAlign: "-0.18em",
                            background: alpha(phos, 1),
                            boxShadow: `0 0 8px ${alpha(phos, 0.8)}`,
                            opacity: 1,
                            animation: reduced ? "none" : `${c}-blink 1.05s steps(1) infinite`,
                          }}
                        />
                      ) : null}
                    </div>
                  ) : null}
                  <textarea
                    ref={taRef}
                    className={`${c}-ta`}
                    aria-label="Message"
                    placeholder={prompts[0] || "Ask anything"}
                    rows={2}
                    value={value}
                    disabled={phase === "sending"}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) => {
                      stopFill();
                      setValue(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        void send();
                        return;
                      }
                      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
                        play("key");
                        bump();
                      }
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      resize: "none",
                      border: 0,
                      outline: "none",
                      background: "transparent",
                      color: alpha(phos, 1),
                      textShadow: glow,
                      font: `500 ${compact ? 16 : 18}px/1.5 ${MONO}`,
                      padding: 0,
                      margin: 0,
                      minHeight: compact ? 72 : 84,
                      maxHeight: 220,
                      overflowY: "auto",
                      opacity: phase === "sending" ? 0.55 : 1,
                      scrollbarWidth: "thin",
                      scrollbarColor: `${alpha(phos, 0.4)} transparent`,
                    }}
                  />
                </div>
              </div>

              {files.length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10, font: `500 12px/1 ${MONO}` }}>
                  {files.map((f, i) => (
                    <span
                      key={`${f.name}-${i}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 6px 5px 8px",
                        border: `1px solid ${alpha(phos, 0.45)}`,
                        borderRadius: 3,
                        maxWidth: 220,
                      }}
                    >
                      <span aria-hidden="true">&#9632;</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                      <button
                        type="button"
                        className={`${c}-x`}
                        aria-label={`Remove ${f.name}`}
                        onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              {/* glass: scanlines, rolling bar, reflection */}
              {scanlines ? (
                <>
                  <div
                    aria-hidden="true"
                    className={`${c}-m`}
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "repeating-linear-gradient(180deg, rgba(0,0,0,.28) 0 1px, rgba(0,0,0,0) 1px 3px)",
                      pointerEvents: "none",
                      animation: reduced ? "none" : `${c}-flicker 4s steps(8) infinite`,
                    }}
                  />
                  {!reduced ? (
                    <div
                      aria-hidden="true"
                      className={`${c}-m`}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        height: "35%",
                        background: `linear-gradient(180deg, transparent, ${alpha(phos, 0.035)}, transparent)`,
                        pointerEvents: "none",
                        animation: `${c}-roll 7s linear infinite`,
                      }}
                    />
                  ) : null}
                </>
              ) : null}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background: "linear-gradient(160deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.02) 26%, rgba(255,255,255,0) 40%)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* ---------------------------- control row ---------------------------- */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: compact ? 12 : 18,
              marginTop: compact ? 14 : 18,
              padding: "0 2px",
            }}
          >
            {/* attach */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span aria-hidden="true" style={engraved}>
                Attach
              </span>
              <button
                type="button"
                className={`${c}-key ${c}-f`}
                aria-label={files.length ? `Attach files, ${files.length} attached` : "Attach files"}
                disabled={phase === "sending"}
                onClick={() => {
                  play("key");
                  fileRef.current?.click();
                }}
                style={{
                  ...keyLook(keyBase),
                  width: compact ? 48 : 56,
                  height: 42,
                  marginBottom: 5,
                  color: inkCss,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21.4 11.1 12.2 20.3a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
                </svg>
                {files.length ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      padding: "0 4px",
                      boxSizing: "border-box",
                      background: alpha(accent, 1),
                      color: accentInk,
                      font: `700 10px/18px ${MONO}`,
                      boxShadow: "0 1px 2px rgba(0,0,0,.3)",
                    }}
                  >
                    {files.length}
                  </span>
                ) : null}
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                tabIndex={-1}
                aria-hidden="true"
                style={{ display: "none" }}
                onChange={(e) => {
                  const list = e.target.files ? Array.from(e.target.files) : [];
                  if (list.length) {
                    setFiles((f) => [...f, ...list].slice(0, 8));
                    bump(0.5);
                  }
                  e.target.value = "";
                }}
              />
            </div>

            {/* model knob */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div aria-hidden="true" style={{ display: "flex", gap: compact ? 8 : 12 }}>
                {modelList.map((m, i) => (
                  <span
                    key={m + i}
                    onClick={() => setModel(i)}
                    style={{
                      ...engraved,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                      color: i === modelIdx ? inkCss : alpha(ink, 0.45),
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: i === modelIdx ? alpha(accent, 1) : alpha(ink, 0.2),
                        boxShadow: i === modelIdx ? `0 0 6px ${alpha(accent, 0.9)}` : "none",
                      }}
                    />
                    {!compact || i === modelIdx ? m : null}
                  </span>
                ))}
              </div>
              <div
                role="slider"
                tabIndex={0}
                className={`${c}-f`}
                aria-label="Model"
                aria-valuemin={0}
                aria-valuemax={modelList.length - 1}
                aria-valuenow={modelIdx}
                aria-valuetext={modelList[modelIdx]}
                onPointerDown={onKnobDown}
                onPointerMove={onKnobMove}
                onPointerUp={onKnobUp}
                onPointerCancel={() => (drag.current = null)}
                onKeyDown={onKnobKey}
                style={{
                  position: "relative",
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  cursor: "grab",
                  touchAction: "none",
                  marginBottom: 3,
                  background: `radial-gradient(circle at 50% 50%, ${mix(body, BLACK, 0.5)} 60%, ${mix(body, BLACK, 0.35)} 72%)`,
                  boxShadow: `0 1px 0 rgba(255,255,255,.7), inset 0 1px 2px rgba(0,0,0,.5)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 3,
                    borderRadius: "50%",
                    transform: `rotate(${knobAngle}deg)`,
                    transition: reduced ? "none" : "transform .18s cubic-bezier(.3,1.4,.5,1)",
                    background: `radial-gradient(circle at 50% 50%, transparent 54%, rgba(0,0,0,.18) 56%, transparent 60%), repeating-conic-gradient(from 0deg, ${mix(keyBase, BLACK, 0.08)} 0 6deg, ${mix(keyBase, WHITE, 0.25)} 6deg 12deg), ${css(keyBase)}`,
                    boxShadow: `0 3px 0 ${mix(keyBase, BLACK, 0.35)}, 0 6px 10px -2px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.8)`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 7,
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 40% 30%, ${mix(keyBase, WHITE, 0.55)}, ${css(keyBase)} 60%, ${mix(keyBase, BLACK, 0.1)})`,
                      boxShadow: "inset 0 -1px 1px rgba(0,0,0,.15)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 3,
                      width: 3,
                      height: 11,
                      marginLeft: -1.5,
                      borderRadius: 2,
                      background: alpha(accent, 1),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* send */}
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <span aria-hidden="true" style={{ ...engraved, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: hasText || phase !== "idle" ? alpha(accent, 1) : alpha(ink, 0.2),
                    boxShadow: hasText || phase !== "idle" ? `0 0 7px ${alpha(accent, 0.95)}` : "inset 0 1px 1px rgba(0,0,0,.3)",
                    transition: "background .2s, box-shadow .2s",
                  }}
                />
                {compact ? "Send" : "Transmit"}
              </span>
              <button
                type="button"
                className={`${c}-key ${c}-f`}
                aria-label="Send message"
                disabled={!hasText || phase === "sending"}
                data-down={phase === "sending" ? "true" : "false"}
                onClick={() => void send()}
                style={{
                  ...keyLook(accent, 11),
                  height: 42,
                  marginBottom: 5,
                  padding: compact ? "0 16px" : "0 22px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  color: accentInk,
                  font: `800 13px/1 ${SANS}`,
                  letterSpacing: "0.08em",
                  opacity: !hasText && phase === "idle" ? 0.82 : 1,
                }}
              >
                SEND
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 10 4 15l5 5" />
                  <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ---------------------------- suggestions ---------------------------- */}
        {suggestions.length ? (
          <div
            style={{
              ...anim(0.22),
              ...(compact
                ? { display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", columnGap: 10, rowGap: 6 }
                : { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }),
              marginTop: compact ? 26 : 34,
            }}
          >
            {suggestions.slice(0, 6).map((s, i) => (
              <button
                key={s + i}
                type="button"
                className={`${c}-key ${c}-f`}
                disabled={phase === "sending"}
                onClick={() => {
                  play("key");
                  typeIn(s);
                }}
                style={{
                  ...keyLook(keyBase, 8),
                  height: 36,
                  marginBottom: 5,
                  padding: compact ? "0 10px" : "0 12px 0 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: compact ? "center" : undefined,
                  minWidth: 0,
                  gap: 8,
                  color: inkCss,
                  font: `600 ${compact ? 12 : 13}px/1 ${SANS}`,
                }}
              >
                {!compact ? (
                  <span
                    aria-hidden="true"
                    style={{
                      font: `700 9px/1 ${MONO}`,
                      letterSpacing: "0.06em",
                      padding: "3px 4px",
                      borderRadius: 3,
                      background: alpha(ink, 0.08),
                      color: alpha(ink, 0.6),
                    }}
                  >
                    F{i + 1}
                  </span>
                ) : null}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
              </button>
            ))}
          </div>
        ) : null}

        <p
          style={{
            ...anim(0.28),
            margin: compact ? "22px 0 0" : "26px 0 0",
            font: `500 11px/1.6 ${MONO}`,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textAlign: "center",
            color: "color-mix(in oklab, currentColor 46%, transparent)",
          }}
        >
          <span>&#8629; send</span>
          <span aria-hidden="true">{"  ·  "}</span>
          <span>shift &#8629; new line</span>
          {!compact ? (
            <>
              <span aria-hidden="true">{"  ·  "}</span>
              <span>ctrl/&#8984; K focus</span>
            </>
          ) : null}
        </p>

        {children}
      </div>
    </section>
  );
}

export default RetroAiChat;
