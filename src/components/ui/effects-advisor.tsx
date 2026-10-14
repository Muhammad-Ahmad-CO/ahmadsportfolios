import { useState } from "react";
import { Wand2, X } from "lucide-react";
import { recommendEffects, type EffectsAdvice } from "@/lib/effects-advisor.functions";

type Props = { onApply: (showStar: boolean) => void };

const sel = "w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-[#D7E2EA]";

export function EffectsAdvisor({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState("laptop");
  const [performance, setPerformance] = useState("medium");
  const [motion, setMotion] = useState("some");
  const [battery, setBattery] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [advice, setAdvice] = useState<EffectsAdvice | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setAdvice(null);
    try {
      const nav = navigator as Navigator & { deviceMemory?: number };
      const r = await recommendEffects({ data: {
        device, performance, motion, battery, notes,
        detected: {
          cores: nav.hardwareConcurrency ?? null,
          memory: nav.deviceMemory ?? null,
          width: window.innerWidth,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        },
      } as never });
      if (r.error) setError(r.error); else if (r.advice) setAdvice(r.advice);
    } catch {
      setError("Couldn't get a recommendation. Please try again later.");
    } finally { setLoading(false); }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Effects advisor"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#D7E2EA] hover:bg-white/10">
        <Wand2 className="h-4 w-4" />
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="fx-title"
          className="fixed bottom-20 left-1/2 z-[60] w-[min(92vw,380px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/85 p-5 text-[#D7E2EA] shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="fx-title" className="text-base font-semibold">Personalize visual effects</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={submit} className="space-y-3 text-sm">
            <label className="block">Device
              <select className={sel} value={device} onChange={(e) => setDevice(e.target.value)}>
                <option value="phone">Phone</option><option value="tablet">Tablet</option>
                <option value="laptop">Laptop</option><option value="desktop">Desktop</option>
              </select>
            </label>
            <label className="block">How powerful is it?
              <select className={sel} value={performance} onChange={(e) => setPerformance(e.target.value)}>
                <option value="low">Older / slow</option><option value="medium">Average</option><option value="high">Fast</option>
              </select>
            </label>
            <label className="block">Motion you're comfortable with
              <select className={sel} value={motion} onChange={(e) => setMotion(e.target.value)}>
                <option value="minimal">As little as possible</option><option value="some">Some</option><option value="full">All the effects</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={battery} onChange={(e) => setBattery(e.target.checked)} /> Save battery
            </label>
            <input className={sel} placeholder="Anything else? (optional)" maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#D7E2EA] py-2 font-medium text-black disabled:opacity-60">
              {loading ? "Thinking…" : "Get recommendation"}
            </button>
          </form>
          <div aria-live="polite" className="mt-3 text-sm">
            {error && <p className="text-red-300">{error}</p>}
            {advice && (
              <div className="space-y-2">
                <p>{advice.summary}</p>
                <ul className="list-disc space-y-1 pl-5 opacity-80">{advice.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="opacity-70">Floating star: <strong>{advice.floatingStar ? "On" : "Off"}</strong></p>
                <button type="button" onClick={() => { onApply(advice.floatingStar); setOpen(false); }}
                  className="w-full rounded-lg border border-white/20 py-2 hover:bg-white/10">Apply settings</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
