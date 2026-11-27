"use client";

import * as React from "react";

/**
 * LaunchGateButton — the 3D isometric mechanical keycap "LAUNCH" button,
 * rebuilt as a native React component in the portfolio's own theme
 * (dark screen, light keycap face, cyan accent) instead of the pasted
 * iframe version, so it matches the site exactly and carries no colour
 * palette UI.
 *
 * The keycap is a real <button>: 50 stacked layers form the sloped sides,
 * the top face sits at translateZ(50px), and pressing it (mouse, touch or
 * keyboard) squashes the extrusion, like a real keycap travelling down.
 */

const DEPTH = 50;
const SHRINK = 0.2;

export interface LaunchGateButtonProps {
  onLaunch: () => void;
  label?: string;
  /** Ref forwarded to the underlying <button> (React 19 ref-as-prop). */
  ref?: React.Ref<HTMLButtonElement>;
}

export default function LaunchGateButton({
  onLaunch,
  label = "LAUNCH",
  ref,
}: LaunchGateButtonProps) {
  const layers = React.useMemo(
    () =>
      Array.from({ length: DEPTH - 1 }, (_, i) => {
        const z = i + 1;
        const scale = 1 - (z / DEPTH) * SHRINK;
        return (
          <div
            key={z}
            aria-hidden="true"
            className="lgb-layer"
            style={{ transform: `translateZ(${z}px) scale(${scale})` }}
          />
        );
      }),
    [],
  );

  const finalScale = 1 - SHRINK;

  return (
    <div className="lgb-wrap">
      <style>{`
        .lgb-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 44px;
          animation: lgb-enter 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes lgb-enter {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lgb-scene {
          perspective: 2000px;
          filter: drop-shadow(0 0 28px rgba(98, 200, 212, 0.16));
        }
        .lgb-btn {
          position: relative;
          width: 220px;
          height: 140px;
          transform: rotateX(60deg) rotateZ(-45deg);
          transform-style: preserve-3d;
          cursor: pointer;
          outline: none;
          border: none;
          background: transparent;
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .lgb-btn:focus-visible {
          outline: 2px solid #62c8d4;
          outline-offset: 26px;
          border-radius: 12px;
        }
        .lgb-socket {
          position: absolute;
          inset: -20px;
          background: #15181a;
          border-radius: 24px;
          border: 2px solid #23282b;
          box-shadow:
            0 5px 15px rgba(0, 0, 0, 0.5),
            inset 4px 4px 8px rgba(0, 0, 0, 0.6),
            inset -4px -4px 8px rgba(255, 255, 255, 0.04),
            inset 10px 10px 20px rgba(0, 0, 0, 0.3);
          transform: translateZ(0);
        }
        .lgb-extrusion {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          transform: scaleZ(1);
        }
        .lgb-layer {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, #8fa6b3 50%, #c3d2da 50%);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.03);
        }
        .lgb-top {
          position: absolute;
          inset: 0;
          background: #d7e2ea;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #0c0c0c;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 2px;
          border: 2px solid #62c8d4;
          box-shadow:
            inset 0 0 20px rgba(0, 0, 0, 0.04),
            inset 2px 2px 5px rgba(255, 255, 255, 0.9),
            0 0 0 0 rgba(98, 200, 212, 0.35);
          transform: translateZ(${DEPTH}px) scale(${finalScale});
          transition: background 0.2s ease, box-shadow 0.2s ease;
          animation: lgb-glow 2.4s ease-in-out infinite;
        }
        @keyframes lgb-glow {
          0%, 100% { box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.04), inset 2px 2px 5px rgba(255, 255, 255, 0.9), 0 0 0 0 rgba(98, 200, 212, 0.28); }
          50% { box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.04), inset 2px 2px 5px rgba(255, 255, 255, 0.9), 0 0 26px 2px rgba(98, 200, 212, 0.28); }
        }
        .lgb-btn:active .lgb-extrusion {
          transform: scaleZ(0.3);
        }
        .lgb-btn:active .lgb-top {
          background: #b9c9d4;
          animation: none;
        }
        .lgb-hint {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(215, 226, 234, 0.55);
          user-select: none;
        }
        @media (max-width: 480px) {
          .lgb-scene { transform: scale(0.78); }
          .lgb-wrap { gap: 30px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lgb-wrap { animation: none; }
          .lgb-top { animation: none; }
        }
      `}</style>

      <div className="lgb-scene">
        <button
          ref={ref}
          type="button"
          className="lgb-btn"
          onClick={onLaunch}
          aria-label="Launch — open the website"
        >
          <div className="lgb-socket" aria-hidden="true" />
          <div className="lgb-extrusion">
            {layers}
            <div className="lgb-top">{label}</div>
          </div>
        </button>
      </div>

      <div className="lgb-hint" aria-hidden="true">
        Tap to enter
      </div>
    </div>
  );
}
