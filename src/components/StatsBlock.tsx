/**
 * StatsBlock — renders 4 animated stat cards.
 * Each card ref is passed from HeroSection for GSAP targeting.
 */
import React from "react";

export interface StatItem {
  value: string;
  label: string;
  accent?: "orange" | "blue";
}

export const STATS: StatItem[] = [
  { value: "150%", label: "Growth",      accent: "orange" },
  { value: "2.5×", label: "Engagement",  accent: "blue"   },
  { value: "98%",  label: "Retention",   accent: "orange" },
  { value: "24/7", label: "Performance", accent: "blue"   },
];

interface StatsBlockProps {
  statRefs: React.RefObject<HTMLDivElement>[];
}

const StatsBlock: React.FC<StatsBlockProps> = ({ statRefs }) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-10">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          ref={statRefs[i]}
          /* Initial state set by GSAP — opacity 0, y 30 */
          className="glass-card gpu-promote flex flex-col items-center px-8 py-5 rounded-xl min-w-[120px]"
        >
          <span
            className={`stat-number font-mono ${
              stat.accent === "orange" ? "text-neon-orange" : "text-neon-blue"
            }`}
          >
            {stat.value}
          </span>
          <span className="mt-1 text-xs tracking-[0.22em] uppercase text-muted-foreground">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsBlock;
