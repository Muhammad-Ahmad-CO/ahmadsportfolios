export type IntegrationItem = {
  label: string;
  slug: string;
};

const logoUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}/e5e7eb`;

export const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { label: "TensorFlow", slug: "tensorflow" },
  { label: "PyTorch", slug: "pytorch" },
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
  { label: "Python", slug: "python" },
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
  return (
    <div className="shrink-0 flex items-center gap-3 rounded-2xl px-5 py-4 md:px-6 md:py-5 border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <span className="grid place-items-center h-[52px] w-[52px] md:h-[64px] md:w-[64px] shrink-0 rounded-xl bg-white/[0.06] border border-white/10">
        <img
          src={logoUrl(slug)}
          alt={`${label} logo`}
          loading="lazy"
          decoding="async"
          className="h-6 w-6 md:h-7 md:w-7 object-contain"
        />
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
