import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Preloader from "@/components/ui/preloader";

export const Route = createFileRoute("/preloader-preview")({
  component: PreloaderPreview,
  head: () => ({
    meta: [
      { title: "Preloader Preview" },
      { name: "description", content: "Preview and test the enhanced accessible preloader." },
    ],
  }),
});

function PreloaderPreview() {
  const [key, setKey] = useState(0);
  const [duration, setDuration] = useState(1800);
  const [fadeDuration, setFadeDuration] = useState(700);
  const [routeDebounce, setRouteDebounce] = useState(150);
  const [immediate, setImmediate] = useState(false);
  const [showOnRouteChange, setShowOnRouteChange] = useState(true);

  const replay = () => setKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white p-6 md:p-12">
      <Preloader
        key={key}
        duration={duration}
        fadeDuration={fadeDuration}
        routeDebounce={routeDebounce}
        immediate={immediate}
        showOnRouteChange={showOnRouteChange}
      />

      <div className="max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold">Preloader Preview</h1>
          <p className="text-white/60">
            Test the accessible, configurable preloader. Adjust props and replay.
          </p>
        </header>

        <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <Field label={`Duration: ${duration}ms`}>
            <input
              type="range" min={400} max={5000} step={100}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <Field label={`Fade duration: ${fadeDuration}ms`}>
            <input
              type="range" min={100} max={2000} step={50}
              value={fadeDuration}
              onChange={(e) => setFadeDuration(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <Field label={`Route debounce: ${routeDebounce}ms`}>
            <input
              type="range" min={0} max={1000} step={25}
              value={routeDebounce}
              onChange={(e) => setRouteDebounce(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={immediate}
                onChange={(e) => setImmediate(e.target.checked)}
              />
              Immediate fallback (skip initial)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnRouteChange}
                onChange={(e) => setShowOnRouteChange(e.target.checked)}
              />
              Show on route change
            </label>
          </div>

          <button
            onClick={replay}
            className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Replay preloader
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 space-y-2">
          <h2 className="text-white font-medium">Accessibility</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>role="dialog" + aria-modal + aria-label</li>
            <li>aria-live announcements on show/hide</li>
            <li>Body scroll lock while visible</li>
            <li>Focus trapped on hidden sentinel; restored on hide</li>
            <li>Debounced preloader on route transitions</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-white/80">{label}</div>
      {children}
    </div>
  );
}
