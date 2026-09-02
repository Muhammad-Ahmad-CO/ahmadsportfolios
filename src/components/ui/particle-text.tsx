import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  hx: number;
  hy: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
};

export function ParticleText({
  text,
  className = "",
  colors = ["#FFFFFF", "#D7E2EA", "#BBCCD7"],
  density = 3,
}: {
  text: string;
  className?: string;
  colors?: string[];
  density?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999, active: false };
    let intro = 1; // 1 -> 0, initial scatter settle

    const build = () => {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      if (!width || !height) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext("2d");
      if (!octx) return;

      // fit font size to width
      let fontSize = Math.min(height * 0.85, width * 0.22);
      const fit = (size: number) => {
        octx.font = `900 ${size * dpr}px Kanit, system-ui, sans-serif`;
        return octx.measureText(text).width;
      };
      while (fontSize > 8 && fit(fontSize) > width * dpr * 0.94) fontSize -= 2;

      octx.clearRect(0, 0, off.width, off.height);
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText(text, off.width / 2, off.height / 2);

      const data = octx.getImageData(0, 0, off.width, off.height).data;
      const step = Math.max(2, Math.round(density * dpr));
      const next: Particle[] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const alpha = data[(y * off.width + x) * 4 + 3];
          if (alpha > 128) {
            const hx = x / dpr;
            const hy = y / dpr;
            next.push({
              x: hx + (Math.random() - 0.5) * width,
              y: hy + (Math.random() - 0.5) * height * 2,
              hx,
              hy,
              vx: 0,
              vy: 0,
              size: Math.random() < 0.15 ? 1.8 : 1,
              color: colors[(Math.random() * colors.length) | 0],
            });
          }
        }
      }
      particles = next;
      intro = 1;
    };

    const tick = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      intro *= 0.97;

      const R = 90;
      for (const p of particles) {
        // repel from pointer
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.max(Math.sqrt(d2), 0.001);
            const f = (1 - d / R) * 6;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        // spring home
        p.vx += (p.hx - p.x) * 0.055;
        p.vy += (p.hy - p.y) * 0.055;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        const j = intro * 6;
        ctx.fillStyle = p.color;
        ctx.fillRect(
          p.x + (j ? (Math.random() - 0.5) * j : 0),
          p.y + (j ? (Math.random() - 0.5) * j : 0),
          p.size,
          p.size,
        );
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [text, density, colors]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export default ParticleText;
