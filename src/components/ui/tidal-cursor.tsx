import { useEffect, useRef } from "react";

export const TidalCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<
    { x: number; y: number; radius: number; alpha: number }[]
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      ripples.current.push({ x: e.clientX, y: e.clientY, radius: 0, alpha: 0.7 });
    };
    window.addEventListener("mousemove", handleMove);

    let raf = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.current.forEach((r) => {
        r.radius += 1.5;
        r.alpha -= 0.012;
        if (r.alpha > 0) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(215, 226, 234, ${r.alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });
      ripples.current = ripples.current.filter((r) => r.alpha > 0);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
};

export default TidalCursor;
