import * as React from "react";
import { Globe, Mail } from "lucide-react";

/**
 * HangingIdCard — an ID-badge card that hangs from a short lanyard under the
 * "Let's build with AI" heading in the footer.
 *
 * Behaviour (matches the carterogunsola.com/studio reference the user sent):
 *  - gentle pendulum swing from the pin at the top (idle CSS animation)
 *  - cursor tilt + small translate while the pointer moves over the card
 *  - click / tap / Enter flips the card to its back face
 *
 * The root carries `keep-color` so the white card stays white in both themes
 * (light mode inverts the page; keep-color inverts the card back).
 * All transforms are applied imperatively in a rAF loop so pointer movement
 * never re-renders React. No window access during render — SSR safe.
 */
export default function HangingIdCard() {
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const flipperRef = React.useRef<HTMLDivElement>(null);
  const target = React.useRef({ rx: 0, ry: 0, tx: 0, ty: 0, flip: 0 });
  const current = React.useRef({ rx: 0, ry: 0, tx: 0, ty: 0, flip: 0 });
  const [flipped, setFlipped] = React.useState(false);

  React.useEffect(() => {
    target.current.flip = flipped ? 180 : 0;
  }, [flipped]);

  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = target.current;
      const c = current.current;
      c.rx += (t.rx - c.rx) * 0.1;
      c.ry += (t.ry - c.ry) * 0.1;
      c.tx += (t.tx - c.tx) * 0.1;
      c.ty += (t.ty - c.ty) * 0.1;
      c.flip += (t.flip - c.flip) * 0.07;
      const el = flipperRef.current;
      if (el) {
        el.style.transform = `translate3d(${c.tx.toFixed(2)}px, ${c.ty.toFixed(2)}px, 0) rotateX(${c.rx.toFixed(2)}deg) rotateY(${(c.ry + c.flip).toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = sceneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const x = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
    const y = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
    target.current.ry = x * 16;
    target.current.rx = -y * 12;
    target.current.tx = x * 10;
    target.current.ty = y * 8;
  };

  const onPointerLeave = () => {
    target.current.rx = 0;
    target.current.ry = 0;
    target.current.tx = 0;
    target.current.ty = 0;
  };

  return (
    <div className="hidc-root keep-color">
      <style>{`
        .hidc-root { width: 300px; max-width: 100%; }
        .hidc-swing {
          transform-origin: 50% 0;
          animation: hidc-swing 7s ease-in-out infinite;
        }
        @keyframes hidc-swing {
          0%, 100% { transform: rotate(-1.6deg); }
          50% { transform: rotate(1.6deg); }
        }
        .hidc-pin {
          width: 12px; height: 12px; margin: 0 auto;
          border-radius: 999px;
          background: #D7E2EA;
          border: 2px solid #111111;
          box-shadow: 0 0 0 2px rgba(215,226,234,0.25);
        }
        .hidc-line {
          width: 2px; height: 54px; margin: 0 auto;
          background: linear-gradient(180deg, #D7E2EA 0%, #8A94A0 100%);
        }
        .hidc-scene { perspective: 1100px; padding: 6px 10px 10px; cursor: pointer; }
        .hidc-flipper {
          position: relative;
          width: 280px; height: 392px; margin: 0 auto;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .hidc-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
          background: #FFFFFF;
          color: #111111;
          box-shadow:
            0 30px 60px -18px rgba(0,0,0,0.65),
            0 8px 20px rgba(0,0,0,0.35),
            inset 0 0 0 1px rgba(0,0,0,0.06);
        }
        .hidc-back { transform: rotateY(180deg); }
        .hidc-hole {
          position: absolute; top: 10px; left: 50%;
          width: 14px; height: 14px; margin-left: -7px;
          border-radius: 999px;
          background: #F2F2F2;
          border: 2px solid #111111;
          z-index: 2;
        }
        .hidc-barcode {
          height: 44px;
          background: repeating-linear-gradient(90deg,
            #111111 0 2px, transparent 2px 5px,
            #111111 5px 6px, transparent 6px 11px,
            #111111 11px 14px, transparent 14px 17px,
            #111111 17px 18px, transparent 18px 23px);
        }
        .hidc-hint { text-align: center; font-size: 0.72rem; letter-spacing: 0.08em; color: rgba(215,226,234,0.5); margin-top: 10px; }
        @media (prefers-reduced-motion: reduce) {
          .hidc-swing { animation: none; }
        }
      `}</style>

      <div className="hidc-swing">
        <div className="hidc-pin" aria-hidden="true" />
        <div className="hidc-line" aria-hidden="true" />
        <div
          ref={sceneRef}
          className="hidc-scene"
          role="button"
          tabIndex={0}
          aria-label="Identity card. Activate to flip it over."
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
        >
          <div ref={flipperRef} className="hidc-flipper">
            {/* FRONT */}
            <div className="hidc-face">
              <div className="hidc-hole" aria-hidden="true" />
              <div style={{ padding: "30px 20px 18px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "#111111", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, letterSpacing: "0.02em" }}>
                    MA
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em" }}>PORTFOLIO ID</div>
                    <div style={{ fontSize: 10, color: "rgba(17,17,17,0.55)", letterSpacing: "0.08em" }}>EST. 2026</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(17,17,17,0.55)" }}>№ 2026</div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "18px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.18)" }} />
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(17,17,17,0.65)" }}>AVAILABLE FOR WORK</span>
                  </div>
                  <div style={{ marginTop: 14, fontSize: 30, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.01em" }}>
                    Muhammad<br />Ahmed
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "rgba(17,17,17,0.65)" }}>
                    AI-Assisted Web Developer &amp; Product Builder
                  </div>
                </div>

                <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(17,17,17,0.12)", display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "rgba(17,17,17,0.75)" }}>
                    <Mail size={13} strokeWidth={2.2} /> ahmadkaimkhani40@gmail.com
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "rgba(17,17,17,0.75)" }}>
                    <Globe size={13} strokeWidth={2.2} /> ahmadsportfolios.vercel.app
                  </div>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div className="hidc-face hidc-back">
              <div style={{ padding: "34px 22px 20px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(17,17,17,0.55)" }}>
                  MUHAMMAD AHMED — PORTFOLIO
                </div>
                <div style={{ marginTop: 18, fontSize: 34, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
                  Let&rsquo;s build with AI
                </div>
                <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: "rgba(17,17,17,0.65)" }}>
                  Collaborations, projects, or just to say hi — send a message and let&rsquo;s ship something.
                </p>
                <div style={{ marginTop: "auto" }}>
                  <div className="hidc-barcode" aria-hidden="true" />
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: "0.14em", color: "rgba(17,17,17,0.55)", fontWeight: 700 }}>
                    <span>2026 • AHMAD</span>
                    <span>TAP TO FLIP BACK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="hidc-hint">CLICK TO FLIP &nbsp;•&nbsp; MOVE CURSOR TO TILT</p>
    </div>
  );
}
