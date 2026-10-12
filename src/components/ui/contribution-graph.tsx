import type { CSSProperties } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

// Set a verified total here when available. Null keeps the generated sample clearly labelled.
export const CONTRIBUTION_TOTAL: number | null = null;
export const GITHUB_PROFILE_URL = "https://github.com/kaim953";
const PERIOD_LABEL = "since January 2025";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateCalendar() {
  let seed = 9532025;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: 52 }, (_, week) => {
    const quietWeek = random() < 0.12;
    return Array.from({ length: 7 }, (_, day) => {
      const date = new Date(Date.UTC(2025, 0, 5 + week * 7 + day));
      const active = random() < (quietWeek ? 0.12 : 0.3 + (week / 51) * 0.52) * (day === 0 || day === 6 ? 0.75 : 1);
      const count = active ? 1 + Math.floor(random() ** 1.5 * (8 + week / 3)) : 0;
      const level = count === 0 ? 0 : count < 4 ? 1 : count < 9 ? 2 : count < 16 ? 3 : 4;
      return { date: date.toISOString().slice(0, 10), count, level, duration: 13 + random() * 9, delay: -random() * 22 };
    });
  });
}

const CALENDAR = generateCalendar();
const SAMPLE_TOTAL = CALENDAR.flat().reduce((total, cell) => total + cell.count, 0);
const MONTH_WEEKS = MONTHS.map((month, index) => ({
  month,
  week: Math.max(0, CALENDAR.findIndex((days) => days.some((cell) => new Date(cell.date).getUTCMonth() === index))),
}));

export function ContributionGraph() {
  const total = CONTRIBUTION_TOTAL ?? SAMPLE_TOTAL;
  return (
    <section id="contributions" aria-labelledby="contribution-heading" className="contribution-section relative w-full px-5 py-20 sm:px-8 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="contribution-heading" className="text-3xl font-black sm:text-4xl md:text-5xl">
              {total.toLocaleString("en-US")} contributions
            </h2>
            <p className="contribution-secondary mt-2 text-sm sm:text-base">
              {PERIOD_LABEL}{CONTRIBUTION_TOTAL === null ? " · Sample activity" : ""}
            </p>
          </div>
          <Button asChild variant="link" className="contribution-profile h-auto p-0">
            <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer" aria-label="View Muhammad Ahmed on GitHub">
              <Github aria-hidden="true" /> GitHub <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
        <div className="contribution-scroll overflow-x-auto pb-3" tabIndex={0} role="region" aria-label="Contribution calendar, January to December 2025">
          <div className="contribution-calendar">
            <div className="contribution-months contribution-secondary" aria-hidden="true">
              {MONTH_WEEKS.map(({ month, week }) => <span key={month} style={{ gridColumn: week + 1 }}>{month}</span>)}
            </div>
            <div className="contribution-days contribution-secondary" aria-hidden="true">
              <span>Mon</span><span>Wed</span><span>Fri</span>
            </div>
            <div className="contribution-grid" role="img" aria-label={`52 weeks of ${CONTRIBUTION_TOTAL === null ? "sample" : "illustrative"} activity. ${total.toLocaleString("en-US")} contributions; recent months are more active.`}>
              {CALENDAR.flat().map((cell) => (
                <span key={cell.date} className="contribution-cell" data-level={cell.level}
                  title={`${cell.date}: ${cell.count} ${CONTRIBUTION_TOTAL === null ? "sample " : ""}contributions`}
                  style={{ "--twinkle-duration": `${cell.duration.toFixed(3)}s`, "--twinkle-delay": `${cell.delay.toFixed(3)}s` } as CSSProperties}
                />
              ))}
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