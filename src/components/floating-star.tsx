import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** A rounded eight-arm silhouette; the extrusion supplies the soft metallic edge. */
function createStarGeometry() {
  const shape = new THREE.Shape();
  const arms = 8;
  const halfWidth = 0.145;
  const tipCenter = 0.83;
  const cap = halfWidth * 0.55228475;
  for (let arm = 0; arm < arms; arm++) {
    const angle = (arm / arms) * Math.PI * 2;
    const u = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
    const v = new THREE.Vector2(-u.y, u.x);
    const point = (r: number, side: number) => u.clone().multiplyScalar(r).addScaledVector(v, side);
    const start = point(tipCenter, -halfWidth);
    if (arm === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);
    const a = point(tipCenter + cap, -halfWidth);
    const b = point(tipCenter + halfWidth, -cap);
    const tip = point(tipCenter + halfWidth, 0);
    shape.bezierCurveTo(a.x, a.y, b.x, b.y, tip.x, tip.y);
    const c = point(tipCenter + halfWidth, cap);
    const d = point(tipCenter + cap, halfWidth);
    const end = point(tipCenter, halfWidth);
    shape.bezierCurveTo(c.x, c.y, d.x, d.y, end.x, end.y);
    const valleyAngle = angle + Math.PI / arms;
    const valley = new THREE.Vector2(Math.cos(valleyAngle), Math.sin(valleyAngle)).multiplyScalar(0.38);
    const nextAngle = angle + Math.PI * 2 / arms;
    const nextInner = new THREE.Vector2(Math.cos(nextAngle), Math.sin(nextAngle)).multiplyScalar(0.49)
      .add(new THREE.Vector2(Math.sin(nextAngle), -Math.cos(nextAngle)).multiplyScalar(halfWidth));
    const inner = point(0.49, halfWidth);
    shape.lineTo(inner.x, inner.y);
    shape.quadraticCurveTo(valley.x, valley.y, nextInner.x, nextInner.y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.21, steps: 1, bevelEnabled: true,
    bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 5, curveSegments: 12,
  });
  geometry.center();
  return geometry;
}

// Canvas resolves CSS color spaces such as oklch into sRGB for Three.js.
function tokenColor(token: string) {
  const scratch = document.createElement("canvas");
  scratch.width = scratch.height = 1;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  if (!context) return new THREE.Color();
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return new THREE.Color().setRGB(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, THREE.SRGBColorSpace);
}

export default function FloatingStar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // Decoration must never prevent the portfolio from rendering.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
    camera.position.z = 10;
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const reflection = pmrem.fromScene(environment, 0.04);
    scene.environment = reflection.texture;
    environment.dispose();
    pmrem.dispose();
    const light = new THREE.DirectionalLight(tokenColor("--floating-star-light"), 3.5);
    light.position.set(4, 6, 7);
    scene.add(light);
    const geometry = createStarGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: tokenColor("--floating-star-tint"), metalness: 0.9, roughness: 0.35, envMapIntensity: 1.2,
    });
    const star = new THREE.Mesh(geometry, material);
    scene.add(star);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = new THREE.Vector2();
    const easedPointer = new THREE.Vector2();
    const nav = document.querySelector("#hero nav");
    const documentHeight = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let targetProgress = Math.min(1, Math.max(0, window.scrollY / documentHeight()));
    let progress = targetProgress;
    let viewWidth = 1;
    let viewHeight = 1;
    let elapsed = 0;
    let previous = 0;
    let frame = 0;
    let disposed = false;

    function updateHeaderClip() {
      // The existing header lives inside a content stacking context. Clip only this
      // decorative layer beneath its visible footprint, without restyling the header.
      const bottom = Math.max(0, nav?.getBoundingClientRect().bottom ?? 0);
      canvas.style.clipPath = `inset(${bottom}px 0 0 0)`;
    }
    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      viewWidth = viewHeight * camera.aspect;
      star.scale.setScalar(viewHeight * 0.3 / 2.02 * (width < 900 ? 0.62 : 1));
      updateHeaderClip();
      if (reduced.matches && !document.hidden) draw(0);
    }
    function draw(delta: number) {
      const freeze = reduced.matches;
      if (!freeze) {
        elapsed += delta;
        progress = THREE.MathUtils.lerp(progress, targetProgress, 1 - Math.exp(-5 * delta));
        easedPointer.lerp(pointer, 1 - Math.exp(-3 * delta));
      }
      const phase = (freeze ? 0 : progress) * Math.PI * 2;
      const x = freeze ? 0.28 : 0.34 * Math.sin(phase - Math.PI / 2);
      const y = freeze ? 0 : 0.17 * Math.sin(2 * phase);
      const z = freeze ? 0 : 0.45 * Math.sin(phase);
      // Compensate projected position for depth: orbit remains in screen space.
      const depthRatio = (camera.position.z - z) / camera.position.z;
      star.position.set(
        (x + (freeze ? 0 : easedPointer.x * 0.018)) * viewWidth * depthRatio,
        (0.02 - y + (freeze ? 0 : Math.sin(elapsed * Math.PI * 2 / 12.6) * 0.009 + easedPointer.y * 0.015)) * viewHeight * depthRatio,
        z,
      );
      star.rotation.set(
        0.16 + (freeze ? 0 : 0.297 * Math.sin(phase * 2) + easedPointer.y * 0.045),
        0.25 + (freeze ? 0 : phase * 2 + elapsed * Math.PI * 2 / 39 + easedPointer.x * 0.055),
        -0.08 + (freeze ? 0 : 0.192 * Math.sin(phase)),
      );
      renderer.render(scene, camera);
    }
    function animate(now: number) {
      if (disposed || document.hidden || reduced.matches) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      draw(delta);
      frame = requestAnimationFrame(animate);
    }
    function syncPlayback() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (document.hidden) return;
      if (reduced.matches) draw(0);
      else frame = requestAnimationFrame(animate);
    }
    function onScroll() {
      targetProgress = Math.min(1, Math.max(0, window.scrollY / documentHeight()));
      updateHeaderClip();
    }
    function onPointer(event: PointerEvent) {
      if (event.pointerType !== "mouse" || reduced.matches) return;
      pointer.set(event.clientX / window.innerWidth * 2 - 1, 1 - event.clientY / window.innerHeight * 2);
    }
    function resetPointer() { pointer.set(0, 0); }
    resize();
    draw(0);
    syncPlayback();
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.documentElement);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", syncPlayback);
    reduced.addEventListener("change", syncPlayback);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", syncPlayback);
      reduced.removeEventListener("change", syncPlayback);
      geometry.dispose();
      material.dispose();
      reflection.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="floating-star" aria-hidden="true" />;
}