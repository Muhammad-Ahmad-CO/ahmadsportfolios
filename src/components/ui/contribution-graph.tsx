import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContributions, type ContributionDay, type ContributionsData } from "@/lib/contributions.functions";

// Contribution calendar fed by REAL GitHub data only (see
// src/lib/contributions.functions.ts). While loading it renders nothing, and
// on failure it renders only a link to the GitHub profile — never seeded,
// sample, or placeholder squares. GitHub's public page exposes per-day
// intensity levels but not per-day counts, so cells carry no counts at all:
// tooltips show the date only, and the total comes from GitHub's own heading.
export const GITHUB_PROFILE_URL = "https://github.com/Muhammad-Ahmad-CO";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Status =
  | { state: "loading" }
  | { state: "ready"; data: ContributionsData }
  | { state: "error" };

function utcDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function formatDate(iso: string) {
  const d = utcDate(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Sunday-first week columns, padded with nulls so rows stay aligned. */
function buildWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const offset = utcDate(sorted[0].date).getUTCDay();
  const slots: (ContributionDay | null)[] = [...Array<null>(offset).fill(null), ...sorted];
  while (slots.length % 7 !== 0) slots.push(null);
  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7));
  return weeks;
}

/** One label per (year, month) at the first week column containing that month. */
function monthLabels(weeks: (ContributionDay | null)[][]) {
  const labels: { label: string; week: number }[] = [];
  const seen = new Set<string>();
  weeks.forEach((week, i) => {
    for (const day of week) {
      if (!day) continue;
      const d = utcDate(day.date);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      labels.push({ label: MONTHS[d.getUTCMonth()], week: i });
    }
  });
  return labels;
}

/** Deterministic twinkle timing derived from the date, so SSR and client agree. */
function twinkleFor(date: string) {
  let hash = 0;
  for (const ch of date) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const duration = 13 + (hash % 9000) / 1000;
  const delay = -((hash >> 3) % 22000) / 1000;
  return {
    "--twinkle-duration": `${duration.toFixed(3)}s`,
    "--twinkle-delay": `${delay.toFixed(3)}s`,
  } as CSSProperties;
}

export function ContributionGraph() {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    getContributions({ data: {} })
      .then((result) => {
        if (cancelled) return;
        setStatus(result.data ? { state: "ready", data: result.data } : { state: "error" });
      })
      .catch(() => {
        if (!cancelled) setStatus({ state: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === "loading") return null;

  if (status.state === "error") {
    return (
      <section id="contributions" aria-label="GitHub activity" className="contribution-section relative w-full px-5 py-10 sm:px-8 md:px-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="contribution-secondary text-sm sm:text-base">
            GitHub activity could not be loaded.{" "}
            <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="contribution-profile underline underline-offset-4">
              View Muhammad Ahmed on GitHub
            </a>
          </p>
        </div>
      </section>
    );
  }

  const { total, days } = status.data;
  const weeks = buildWeeks(days);
  const labels = monthLabels(weeks);
  const first = days[0].date;
  const last = days[days.length - 1].date;

  return (
    <section id="contributions" aria-labelledby="contribution-heading" className="contribution-section relative w-full px-5 py-20 sm:px-8 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="contribution-heading" className="text-3xl font-black sm:text-4xl md:text-5xl">
              {total.toLocaleString("en-US")} contributions
            </h2>
            <p className="contribution-secondary mt-2 text-sm sm:text-base">in the last year</p>
          </div>
          <Button asChild variant="link" className="contribution-profile h-auto p-0">
            <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer" aria-label="View Muhammad Ahmed on GitHub">
              <Github aria-hidden="true" /> GitHub <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
        <div className="contribution-scroll overflow-x-auto pb-3" tabIndex={0} role="region" aria-label={`Contribution calendar, ${formatDate(first)} to ${formatDate(last)}`}>
          <div className="contribution-calendar" style={{ "--cw": weeks.length } as CSSProperties}>
            <div className="contribution-months contribution-secondary" aria-hidden="true">
              {labels.map(({ label, week }) => (
                <span key={`${label}-${week}`} style={{ gridColumn: week + 1 }}>{label}</span>
              ))}
            </div>
            <div className="contribution-days contribution-secondary" aria-hidden="true">
              <span>Mon</span><span>Wed</span><span>Fri</span>
            </div>
            <div className="contribution-grid" role="img" aria-label={`Contribution calendar: ${total.toLocaleString("en-US")} contributions in the last year, ${formatDate(first)} to ${formatDate(last)}.`}>
              {weeks.flat().map((day, i) =>
                day ? (
                  <span
                    key={day.date}
                    className="contribution-cell"
                    data-level={day.level}
                    data-date={day.date}
                    title={formatDate(day.date)}
                    style={twinkleFor(day.date)}
                  />
                ) : (
                  <span key={`pad-${i}`} className="contribution-cell contribution-cell--empty" aria-hidden="true" />
                ),
              )}
            </div>
          </div>
        </div>
        <div className="contribution-secondary mt-4 flex items-center justify-end gap-2 text-xs" aria-label="Contribution intensity: less to more">
          <span>Less</span>
          {[1, 2, 3, 4].map((level) => <span key={level} className="contribution-legend-cell" data-level={level} aria-hidden="true" />)}
          <span>More</span>
        </div>
      </div>
    </section>
  );
}
