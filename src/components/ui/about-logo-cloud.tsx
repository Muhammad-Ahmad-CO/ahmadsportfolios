import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const LOGOS = [
  ["Python", "python"], ["TensorFlow", "tensorflow"],
  ["PyTorch", "pytorch"], ["scikit-learn", "scikitlearn"],
  ["OpenAI", "openai"], ["Hugging Face", "huggingface"],
  ["LangChain", "langchain"], ["n8n", "n8n"],
  ["JavaScript", "javascript"], ["React", "react"],
  ["Git", "git"], ["Docker", "docker"],
] as const;

function Logo({ name, slug }: { name: string; slug: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="about-tech-chip" title={name}>
      {failed ? <span className="about-tech-fallback" role="img" aria-label={name}>{name[0]}</span> :
        <img ref={(image) => { if (image?.complete && image.naturalWidth === 0) setFailed(true); }} src={`https://cdn.simpleicons.org/${slug}`} alt={name} loading="lazy" onError={() => setFailed(true)} />}
    </div>
  );
}

export function AboutLogoCloud() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 65, damping: 22 });
  const springY = useSpring(y, { stiffness: 65, damping: 22 });

  return (
    <div ref={ref} className="about-logo-cloud" role="group" aria-label="AI and coding technologies"
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse" || !window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) return;
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        x.set(-((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
        y.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 12);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      <motion.div className="about-logo-cluster" style={{ x: springX, y: springY }}>
        {LOGOS.map(([name, slug]) => <div key={slug} className="about-tech-position"><Logo name={name} slug={slug} /></div>)}
      </motion.div>
    </div>
  );
}