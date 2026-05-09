"use client";

/**
 * #9 Daily Streak — Fire counter with progress bar.
 */
export default function DailyStreak({ streak = 5 }: { streak?: number }) {
  const goal = 7; // days for weekly goal
  const progress = Math.min(streak / goal, 1);

  return (
    <div className="flex items-center gap-2">
      <span className="font-pixel text-[11px]" style={{ color: "var(--color-solar-orange)" }}>
        🔥{streak}
      </span>
      <div
        className="flex-1 h-2 overflow-hidden"
        style={{ backgroundColor: "var(--background-secondary)" }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: streak >= 5 ? "var(--color-solar-orange)" : "var(--color-solar-yellow)",
            boxShadow: streak >= 3 ? "0 0 6px var(--color-solar-orange)" : "none",
          }}
        />
      </div>
      <span className="font-pixel text-[8px]" style={{ color: "var(--foreground-secondary)" }}>
        {streak}/{goal}
      </span>
    </div>
  );
}
