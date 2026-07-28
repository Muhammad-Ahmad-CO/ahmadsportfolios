import {
  Bot,
  Brain,
  Camera,
  Cpu,
  Database,
  Eye,
  Gauge,
  GitBranch,
  Hand,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Mic,
  Network,
  Search,
  Settings2,
  Sparkles,
  Terminal,
  Waves,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type IntegrationItem = {
  label: string;
  Icon: LucideIcon;
};

export const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { label: "LLM", Icon: Brain },
  { label: "Computer Vision", Icon: Eye },
  { label: "Automation", Icon: Workflow },
  { label: "MediaPipe", Icon: Hand },
  { label: "RAG", Icon: Search },
  { label: "Agents", Icon: Bot },
  { label: "Prompting", Icon: MessageSquare },
  { label: "Embeddings", Icon: Network },
  { label: "TensorFlow", Icon: Layers },
  { label: "PyTorch", Icon: Zap },
  { label: "OpenAI", Icon: Sparkles },
  { label: "Speech AI", Icon: Waves },
  { label: "Whisper", Icon: Mic },
  { label: "Diffusion", Icon: ImageIcon },
  { label: "Transformers", Icon: Cpu },
  { label: "Edge AI", Icon: Gauge },
  { label: "Pipelines", Icon: GitBranch },
  { label: "Vector DB", Icon: Database },
  { label: "Fine-tuning", Icon: Settings2 },
  { label: "Inference", Icon: Terminal },
  { label: "Multimodal", Icon: Camera },
  { label: "GenAI", Icon: Sparkles },
];

function Card({ item }: { item: IntegrationItem }) {
  const { Icon, label } = item;
  return (
    <div className="shrink-0 flex items-center gap-3 rounded-2xl px-5 py-4 md:px-6 md:py-5 border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <span className="grid place-items-center h-[52px] w-[52px] md:h-[64px] md:w-[64px] shrink-0 rounded-xl bg-white/[0.06] border border-white/10">
        <Icon className="h-6 w-6 md:h-7 md:w-7 text-gray-300" strokeWidth={1.6} />
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
