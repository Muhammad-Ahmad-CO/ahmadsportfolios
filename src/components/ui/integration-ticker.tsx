import { useState } from "react";

export type IntegrationItem = {
  label: string;
  slug: string;
};

const logoUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}/e5e7eb`;

export const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { label: "Hugging Face", slug: "huggingface" },
  { label: "LangChain", slug: "langchain" },
  { label: "Gemini", slug: "googlegemini" },
  { label: "Anthropic", slug: "anthropic" },
  { label: "Ollama", slug: "ollama" },
  { label: "Keras", slug: "keras" },
  { label: "scikit-learn", slug: "scikitlearn" },
  { label: "OpenCV", slug: "opencv" },
  { label: "MediaPipe", slug: "mediapipe" },
  { label: "NVIDIA", slug: "nvidia" },
  { label: "FastAPI", slug: "fastapi" },
  { label: "Supabase", slug: "supabase" },
  { label: "n8n", slug: "n8n" },
  { label: "Zapier", slug: "zapier" },
  { label: "Streamlit", slug: "streamlit" },
  { label: "Replicate", slug: "replicate" },
  { label: "ElevenLabs", slug: "elevenlabs" },
  { label: "Perplexity", slug: "perplexity" },
  { label: "GitHub", slug: "github" },
  { label: "Docker", slug: "docker" },
  { label: "Jupyter", slug: "jupyter" },
];

function Card({ item }: { item: IntegrationItem }) {
  const { slug, label } = item;
  // Deterministic fallback, mirroring the About logo cloud: every icon
  // that fails to load degrades to the same first-letter tile instead of
  // a mix of empty boxes and broken-image glyphs. The ref guard catches
  // images that already failed before hydration attached onError.
  const [failed, setFailed] = useState(false);
  return (
    <div className="shrink-0 flex items-center gap-3 rounded-2xl px-5 py-4 md:px-6 md:py-5 border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <span className="grid place-items-center h-[52px] w-[52px] md:h-[64px] md:w-[64px] shrink-0 rounded-xl bg-white/[0.06] border border-white/10">
        {failed ? (
          <span role="img" aria-label={`${label} logo`} className="text-lg font-semibold leading-none text-gray-200 md:text-xl">{label[0]}</span>
        ) : (
          <img
            ref={(image) => { if (image?.complete && image.naturalWidth === 0) setFailed(true); }}
            src={logoUrl(slug)}
            alt={`${label} logo`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-6 w-6 md:h-7 md:w-7 object-contain"
          />
        )}
      </span>
      <span className="whitespace-nowrap font-semibold uppercase tracking-tight text-base md:text-xl text-gray-400">
        {label}
      </span>
    </div>
  );
}

function Track({
  items,
  reverse,
  duration,
}: {
  items: IntegrationItem[];
  reverse?: boolean;
  duration: number;
}) {
  const tripled = [...items, ...items, ...items];
  return (
    <div
      className="flex w-max gap-4 md:gap-5"
      style={{
        animation: `${reverse ? "ticker-reverse" : "ticker"} ${duration}s linear infinite`,
        willChange: "transform",
      }}
    >
      {tripled.map((it, i) => (
        <Card key={`${it.label}-${i}`} item={it} />
      ))}
    </div>
  );
}

export function IntegrationTicker({
  items = DEFAULT_INTEGRATIONS,
  className = "",
}: {
  items?: IntegrationItem[];
  className?: string;
}) {
  const half = Math.ceil(items.length / 2);
  const topRow = items.slice(0, half);
  const bottomRow = items.slice(half);

  return (
    <div
      className={`space-y-4 md:space-y-5 overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <div className="overflow-hidden">
        <Track items={topRow} reverse duration={20} />
      </div>
      <div className="overflow-hidden">
        <Track items={bottomRow} duration={16} />
      </div>
    </div>
  );
}
