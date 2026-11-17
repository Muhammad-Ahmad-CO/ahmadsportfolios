import { useEffect, useRef } from "react";

/**
 * FAQ "self-build" overlay — ORIGINAL implementation, inspired by the
 * cursor-wireframe animation in the reference reel.
 *
 * When the FAQ section scrolls ~40% into view, a set of classic white
 * arrow pointers (thin black edge, small solid-coloured tag at the tail)
 * fans out from the section center along slow, curved paths. Each cursor
 * pauses at its element, a grey skeleton panel fades in, and the cursor
 * drags along the rectangle's perimeter while the bright-blue outline
 * draws progressively behind it (stroke-dashoffset synced to the cursor);
 * white square handles appear as the cursor passes them and a blue pill
 * shows the element's measured px size once the outline completes. The
 * element's content then fades in whole over the panel. Runs ONCE;
 * afterwards the overlay is removed and the section looks and behaves
 * exactly as before (accordions stay fully interactive).
 *
 * Safety: content is hidden only by a JS-added class (no-JS still shows
 * everything), prefers-reduced-motion skips the animation entirely, and a
 * hard timeout reveals everything if anything goes wrong. No layout is
 * changed: the overlay is absolutely positioned inside the section and
 * pointer-events:none throughout.
 */

type Pt = { x: number; y: number };

type Seg =
  | { kind: "curve"; t0: number; dur: number; p0: Pt; p1: Pt; p2: Pt; p3: Pt }
  | { kind: "perimeter"; t0: number; dur: number; box: { x: number; y: number; w: number; h: number } }
  | { kind: "hold"; t0: number; dur: number; at: Pt };

type CursorPlan = {
  color: string;
  /** time (ms) the cursor pops in at the cluster point */
  appearAt: number;
  segs: Seg[];
  /** the perimeter segment, driving the outline draw progress */
  drawSeg: { t0: number; dur: number };
  /** time (ms) the grey panel fades in (glide end) */
  fillAt: number;
  /** time (ms) the content reveals and the panel fades out (draw end) */
  revealAt: number;
};

type WireBox = {
  root: HTMLDivElement;
  fill: SVGRectElement;
  stroke: SVGRectElement;
  handles: HTMLElement[];
  handleFracs: number[];
  pill: HTMLSpanElement;
  perimeter: number;
};

// One tag colour per cursor, reel palette extended to seven.
const TAG_COLORS = [
  "#EF4444",
  "#22C55E",
  "#06B6D4",
  "#EAB308",
  "#F97316",
  "#EC4899",
  "#8B5CF6",
];

const HARD_TIMEOUT = 9000; // ms: force-reveal fallback

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/** Clockwise point on the stroke rect's perimeter, starting at the
 *  top-left corner. d = distance travelled along the perimeter. */
function perimeterPoint(box: { x: number; y: number; w: number; h: number }, d: number): Pt {
  const a = box.w - 1;
  const b = box.h - 1;
  if (d <= 0) return { x: box.x + 0.5, y: box.y + 0.5 };
  if (d < a) return { x: box.x + 0.5 + d, y: box.y + 0.5 };
  if (d < a + b) return { x: box.x + box.w - 0.5, y: box.y + 0.5 + (d - a) };
  if (d < 2 * a + b) return { x: box.x + box.w - 0.5 - (d - a - b), y: box.y + box.h - 0.5 };
  const dd = Math.min(d, 2 * a + 2 * b);
  return { x: box.x + 0.5, y: box.y + box.h - 0.5 - (dd - 2 * a - b) };
}

function segStart(seg: Seg): Pt {
  if (seg.kind === "curve") return seg.p0;
  if (seg.kind === "hold") return seg.at;
  return { x: seg.box.x + 0.5, y: seg.box.y + 0.5 };
}

function segEnd(seg: Seg): Pt {
  if (seg.kind === "curve") return seg.p3;
  if (seg.kind === "hold") return seg.at;
  return { x: seg.box.x + 0.5, y: seg.box.y + 0.5 };
}

function posAt(segs: Seg[], t: number): Pt {
  if (t <= segs[0].t0) return segStart(segs[0]);
  for (const s of segs) {
    if (t <= s.t0 + s.dur) {
      const p = clamp((t - s.t0) / s.dur, 0, 1);
      if (s.kind === "curve") return cubic(s.p0, s.p1, s.p2, s.p3, easeInOutCubic(p));
      if (s.kind === "hold") return s.at;
      const P = 2 * (s.box.w - 1) + 2 * (s.box.h - 1);
      return perimeterPoint(s.box, p * P);
    }
  }
  return segEnd(segs[segs.length - 1]);
}

function makeCursor(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "faq-cursor";
  el.innerHTML =
    `<svg width="20" height="22" viewBox="0 0 16 22" fill="none" aria-hidden="true">` +
    `<path d="M2 1.5 L2 18.5 L6.2 14.6 L9 20.5 L11.3 19.4 L8.5 13.6 L14.8 13.6 Z" ` +
    `fill="#FFFFFF" stroke="rgba(0,0,0,0.85)" stroke-width="1" stroke-linejoin="round"/></svg>` +
    `<span class="faq-cursor-tag" style="background:${color}"></span>`;
  el.style.opacity = "0";
  return el;
}

function makeWireBox(w: number, h: number): WireBox {
  const a = w - 1;
  const b = h - 1;
  const P = 2 * a + 2 * b;
  const root = document.createElement("div");
  root.className = "faq-wireframe";
  root.innerHTML =
    `<svg width="${w}" height="${h}" aria-hidden="true">` +
    `<rect class="faq-wire-fill" x="0" y="0" width="${w}" height="${h}" fill="#303030" opacity="0"/>` +
    `<rect class="faq-wire-stroke" x="0.5" y="0.5" width="${a}" height="${b}" fill="none" ` +
    `stroke="#3B82F6" stroke-width="1" stroke-dasharray="${P}" stroke-dashoffset="${P}"/>` +
    `</svg>`;
  // Handle positions, keyed to the fraction of the perimeter the cursor
  // has travelled when it passes each one (clockwise from top-left).
  const positions: [string, number][] = [
    ["nw", 0],
    ["n", a / 2 / P],
    ["ne", a / P],
    ["e", (a + b / 2) / P],
    ["se", (a + b) / P],
    ["s", (a + b + a / 2) / P],
    ["sw", (2 * a + b) / P],
    ["w", (2 * a + b + b / 2) / P],
  ];
  const handles: HTMLElement[] = [];
  const handleFracs: number[] = [];
  for (const [pos, frac] of positions) {
    const handle = document.createElement("i");
    handle.className = `faq-wire-handle faq-wire-handle--${pos}`;
    root.appendChild(handle);
    handles.push(handle);
    handleFracs.push(frac);
  }
  const pill = document.createElement("span");
  pill.className = "faq-wire-pill";
  pill.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  root.appendChild(pill);
  return {
    root,
    fill: root.querySelector(".faq-wire-fill") as SVGRectElement,
    stroke: root.querySelector(".faq-wire-stroke") as SVGRectElement,
    handles,
    handleFracs,
    pill,
    perimeter: P,
  };
}

export function FaqBuildOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);

  // The overlay div renders on the server too (empty, invisible, no
  // children) so hydration matches; all behaviour lives in this effect,
  // which only ever runs on the client.
  useEffect(() => {
    const overlay = rootRef.current;
    if (!overlay) return;
    const section = overlay.parentElement;
    if (!section || section.id !== "faq") return;
    if (section.dataset.faqBuild === "done") return;

    // Reduced motion: never hide content, never animate.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    let cancelled = false;
    let raf = 0;
    let hardTimer = 0;
    let observer: IntersectionObserver | null = null;
    let started = false;

    const heading = section.querySelector("h2");
    const rows = Array.from(section.querySelectorAll("details"));

    const cleanup = () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (hardTimer) window.clearTimeout(hardTimer);
      observer?.disconnect();
      heading?.classList.remove("faq-build-done");
      for (const r of rows) r.classList.remove("faq-build-done");
      section.classList.remove("faq-build-prep");
      overlay.replaceChildren();
      // NOTE: do NOT set display:none here. On a remount React may reuse
      // this same DOM node; a stale display:none would then hide the
      // rebuilt overlay forever. Real unmounts remove the node anyway.
    };

    const finish = () => {
      if (cancelled) return;
      heading?.classList.add("faq-build-done");
      for (const r of rows) r.classList.add("faq-build-done");
      section.classList.remove("faq-build-prep");
      section.dataset.faqBuild = "done";
      overlay.replaceChildren();
      overlay.style.display = "none";
    };

    const run = () => {
      if (started || cancelled) return;
      started = true;
      try {
        // Belt and braces: a remount-reused node must never stay hidden.
        overlay.style.display = "";
        // Position from the offset chain (immune to the prep-class
        // translateY on rows); size from getBoundingClientRect.
        const sw = section.clientWidth;
        const sh = section.clientHeight;
        const cx = sw / 2;
        const cy = sh / 2;

        const offsetInSection = (el: Element): Pt => {
          let x = 0;
          let y = 0;
          let cur: HTMLElement | null = el as HTMLElement;
          while (cur && cur !== section) {
            x += cur.offsetLeft;
            y += cur.offsetTop;
            cur = cur.offsetParent as HTMLElement | null;
          }
          return { x, y };
        };

        const targets: { el: Element; x: number; y: number; w: number; h: number }[] = [];
        if (heading) {
          const p = offsetInSection(heading);
          const r = heading.getBoundingClientRect();
          targets.push({ el: heading, x: p.x, y: p.y, w: r.width, h: r.height });
        }
        for (const r of rows) {
          const p = offsetInSection(r);
          const rect = r.getBoundingClientRect();
          targets.push({ el: r, x: p.x, y: p.y, w: rect.width, h: rect.height });
        }
        if (targets.length === 0) {
          finish();
          return;
        }

        // Dot-grid backdrop (build only, fades out with the overlay).
        const grid = document.createElement("div");
        grid.className = "faq-build-grid";
        overlay.appendChild(grid);
        grid.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: "forwards" });

        const clampPt = (p: Pt): Pt => ({
          x: clamp(p.x, 6, Math.max(6, sw - 30)),
          y: clamp(p.y, 6, Math.max(6, sh - 30)),
        });

        // One cursor per element: slow curved glide in, pause, drag the
        // outline around the perimeter, then a short curved retreat.
        const plans: CursorPlan[] = targets.map((t, i) => {
          const angle = i * 2.4;
          const radius = 12 + i * 3;
          const start = {
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
          };
          const box = { x: t.x, y: t.y, w: t.w, h: t.h };
          const corner = { x: t.x + 0.5, y: t.y + 0.5 };
          const glideStart = 350 + i * 280;
          const glideDur = 650;
          const dx = corner.x - start.x;
          const dy = corner.y - start.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const bend = (i % 2 === 0 ? 1 : -1) * (36 + ((i * 17) % 48));
          const p1 = clampPt({
            x: start.x + dx * 0.3 + nx * bend,
            y: start.y + dy * 0.3 + ny * bend,
          });
          const p2 = clampPt({
            x: start.x + dx * 0.7 + nx * bend,
            y: start.y + dy * 0.7 + ny * bend,
          });
          const pauseDur = 150;
          const drawStart = glideStart + glideDur + pauseDur;
          const P = 2 * (t.w - 1) + 2 * (t.h - 1);
          const drawDur = clamp(P / 2.2, 550, 1200);
          const revealAt = drawStart + drawDur;
          const retreatStart = revealAt + 150;
          const rest = clampPt({ x: corner.x - 26, y: corner.y - 20 });
          const rdx = rest.x - corner.x;
          const rdy = rest.y - corner.y;
          const rlen = Math.hypot(rdx, rdy) || 1;
          const rnx = -rdy / rlen;
          const rny = rdx / rlen;
          const rbend = (i % 2 === 0 ? -1 : 1) * 14;
          const rp1 = clampPt({
            x: corner.x + rdx * 0.35 + rnx * rbend,
            y: corner.y + rdy * 0.35 + rny * rbend,
          });
          const rp2 = clampPt({
            x: corner.x + rdx * 0.7 + rnx * rbend,
            y: corner.y + rdy * 0.7 + rny * rbend,
          });
          return {
            color: TAG_COLORS[i % TAG_COLORS.length],
            appearAt: i * 70,
            segs: [
              { kind: "hold", t0: 0, dur: glideStart, at: start },
              { kind: "curve", t0: glideStart, dur: glideDur, p0: start, p1, p2, p3: corner },
              { kind: "hold", t0: glideStart + glideDur, dur: pauseDur, at: corner },
              { kind: "perimeter", t0: drawStart, dur: drawDur, box },
              { kind: "hold", t0: revealAt, dur: 150, at: corner },
              { kind: "curve", t0: retreatStart, dur: 350, p0: corner, p1: rp1, p2: rp2, p3: rest },
              { kind: "hold", t0: retreatStart + 350, dur: 10000, at: rest },
            ],
            drawSeg: { t0: drawStart, dur: drawDur },
            fillAt: glideStart + glideDur,
            revealAt,
          };
        });

        const lastReveal = Math.max(...plans.map((p) => p.revealAt));
        const finishAt = lastReveal + 700;
        const removeAt = finishAt + 450;

        // Wireframe boxes (invisible until their cursor arrives: fill
        // opacity 0, stroke fully offset, handles/pill opacity 0).
        const boxes = targets.map((t) => {
          const box = makeWireBox(t.w, t.h);
          box.root.style.left = `${t.x}px`;
          box.root.style.top = `${t.y}px`;
          box.root.style.width = `${t.w}px`;
          box.root.style.height = `${t.h}px`;
          overlay.appendChild(box.root);
          return box;
        });

        // Cursor elements (hidden until their appearAt; the rAF loop below
        // drives both position and the pop-in, so no WAAPI here — a
        // fill-forwards transform animation would override the translate).
        const cursorEls = plans.map((plan) => {
          const el = makeCursor(plan.color);
          overlay.appendChild(el);
          return el;
        });

        // Scheduled actions.
        const actions: { t: number; done: boolean; fn: () => void }[] = [];
        const at = (t: number, fn: () => void) => actions.push({ t, done: false, fn });

        plans.forEach((plan, i) => {
          // Grey skeleton panel fades in as the cursor pauses at the corner.
          at(plan.fillAt, () => {
            boxes[i].fill.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 180,
              fill: "forwards",
            });
          });
          // Outline complete: content fades in whole as the panel fades out.
          at(plan.revealAt, () => {
            (targets[i].el as HTMLElement).classList.add("faq-build-done");
            boxes[i].fill.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 300,
              fill: "forwards",
            });
          });
        });

        // Fade everything out, then finish.
        at(finishAt, () => {
          for (const el of [...cursorEls, ...boxes.map((b) => b.root), grid]) {
            el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 400,
              fill: "forwards",
            });
          }
        });
        at(removeAt, () => finish());

        const t0 = performance.now();
        const tick = () => {
          if (cancelled) return;
          const now = performance.now() - t0;
          for (const a of actions) {
            if (!a.done && now >= a.t) {
              a.done = true;
              a.fn();
            }
          }
          plans.forEach((plan, i) => {
            const p = posAt(plan.segs, now);
            const el = cursorEls[i];
            const appeared = now >= plan.appearAt;
            const popP = appeared ? Math.min(1, (now - plan.appearAt) / 180) : 0;
            const scale = 0.5 + 0.5 * easeOutCubic(popP);
            el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${appeared ? scale : 0.5})`;
            el.style.opacity = appeared ? String(easeOutCubic(popP)) : "0";
            // Outline draw progress, synced to the cursor on the perimeter.
            const dp = clamp((now - plan.drawSeg.t0) / plan.drawSeg.dur, 0, 1);
            const box = boxes[i];
            box.stroke.setAttribute("stroke-dashoffset", String(box.perimeter * (1 - dp)));
            const drawing = dp > 0.01;
            box.handles.forEach((h, hi) => {
              h.style.opacity = drawing && dp >= box.handleFracs[hi] ? "1" : "0";
            });
            box.pill.style.opacity = dp >= 1 ? "1" : "0";
          });
          if (now < removeAt + 100) {
            raf = requestAnimationFrame(tick);
          }
        };
        raf = requestAnimationFrame(tick);

        // Hard fallback: never leave the FAQ hidden.
        hardTimer = window.setTimeout(() => {
          if (!cancelled && section.dataset.faqBuild !== "done") finish();
        }, HARD_TIMEOUT);
      } catch (err) {
        // Never leave the FAQ hidden; log the failure for diagnosis.
        console.error("[faq-build] run failed", err);
        finish();
      }
    };

    // Hide content (JS only) as soon as the client is ready, so the section
    // is already "empty" if the user scrolls to it before the observer fires.
    // Reset display first: if a previous effect instance's cleanup ran on
    // this reused node, it must not stay hidden.
    overlay.style.display = "";
    section.classList.add("faq-build-prep");
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            observer?.disconnect();
            run();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(section);

    return cleanup;
  }, []);

  return <div ref={rootRef} className="faq-build-overlay" aria-hidden="true" />;
}
