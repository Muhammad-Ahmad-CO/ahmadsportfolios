import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Real GitHub contributions data for the portfolio's contribution calendar.
//
// Source: GitHub's own public contributions page for Muhammad-Ahmad-CO. No
// token, no third-party renderer, no authentication of any kind — the page is
// public. The server fetches it, parses the real day cells (date + GitHub's
// own 0-4 intensity level) and the real "N contributions in the last year"
// total, and returns exactly that. Nothing is seeded, sampled, or invented:
// GitHub's public page does not expose per-day counts without auth, so the
// calendar shows levels + total only, and never fabricates counts.
//
// On any failure (network error, non-OK status, unparseable page) the handler
// returns { error } and the client hides the grid entirely — the failure path
// must never render placeholder squares. Failures are not cached, so the
// next visit retries.

export type ContributionDay = {
  /** ISO date, e.g. "2026-11-10". */
  date: string;
  /** GitHub's own intensity bucket, 0 (none) to 4 (most). */
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionsData = {
  /** Total from GitHub's own "N contributions in the last year" heading. */
  total: number;
  /** Every day GitHub returned, ascending by date. */
  days: ContributionDay[];
  /** ISO timestamp of the server-side fetch, for freshness debugging. */
  fetchedAt: string;
};

export type ContributionsResult = { data?: ContributionsData; error?: string };

const SOURCE_URL = "https://github.com/users/Muhammad-Ahmad-CO/contributions";
// Test seam only: lets the failure-mode probe point the fetch at an invalid
// host. Never set in production; the default is the real GitHub page.
const SOURCE_OVERRIDE = process.env.CONTRIBUTIONS_SOURCE_URL;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cache: { at: number; result: ContributionsResult } | null = null;

const DAY_CELL_RE =
  /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="([0-4])"[^>]*>/g;
const TOTAL_RE = /([\d,]+)\s+contributions\s+in the last year/;

function parseContributions(html: string): ContributionsData | null {
  const totalMatch = TOTAL_RE.exec(html);
  if (!totalMatch) return null;
  const total = Number(totalMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(total) || total < 0) return null;

  const byDate = new Map<string, ContributionDay>();
  for (const match of html.matchAll(DAY_CELL_RE)) {
    const level = Number(match[2]);
    if (level < 0 || level > 4) return null;
    byDate.set(match[1], { date: match[1], level: level as ContributionDay["level"] });
  }
  if (byDate.size === 0) return null;
  const days = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { total, days, fetchedAt: new Date().toISOString() };
}

export const getContributions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({}).parse(data))
  .handler(async (): Promise<ContributionsResult> => {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.result;
    try {
      const res = await fetch(SOURCE_OVERRIDE || SOURCE_URL, {
        signal: AbortSignal.timeout(8000),
        headers: {
          Accept: "text/html",
          "User-Agent": "Mozilla/5.0 (compatible; portfolio-contributions/1.0)",
        },
      });
      if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
      const data = parseContributions(await res.text());
      if (!data) throw new Error("Could not parse the contributions page");
      const result: ContributionsResult = { data };
      cache = { at: Date.now(), result };
      return result;
    } catch {
      return { error: "GitHub activity could not be loaded." };
    }
  });
