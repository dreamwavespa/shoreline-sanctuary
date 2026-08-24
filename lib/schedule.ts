// Traveling & Special Characters — appearance schedule.
// Source: lib/villagers.ts "schedule" flavor text for Shelldon, Shelby, and
// Misty. Angel has no schedule and is always available.
//
// All calculations are deterministic based on the wall-clock date, so every
// player sees the same visitor on the same real-world day/night — no save
// data required. Computed client-side only (see components that call this
// from inside a useEffect) to avoid SSR/client hydration mismatches.

export type ScheduledVillagerId = "shelldon" | "shelby" | "misty";

export interface ScheduleStatus {
  available: boolean;
  /** Short present-tense flavor label, e.g. "Here today!" or "Full moon tonight!" */
  presentLabel: string;
  /** Shown when away — when they'll next be around. */
  awayLabel: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayIndex(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
}

// ── Shelldon the Giant Sea Turtle — "Shelldon Sundays" ────────────────────
function isShelldonDay(date: Date): boolean {
  return date.getDay() === 0; // Sunday
}

// ── Shelby the Crab Captain — arrives with the Trading Ship ─────────────
// The trading ship docks on a steady 4-day rotation so it's predictable
// without needing a real calendar rule.
const TRADING_SHIP_INTERVAL_DAYS = 4;
function isTradingShipDay(date: Date): boolean {
  return dayIndex(date) % TRADING_SHIP_INTERVAL_DAYS === 0;
}

// ── Misty the Moon Jellyfish — full moon nights only ──────────────────
const SYNODIC_MONTH_DAYS = 29.53058867;
// A known new moon reference point (Jan 6, 2000, 18:14 UTC).
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
function moonPhase(date: Date): number {
  const days = (date.getTime() - KNOWN_NEW_MOON_MS) / DAY_MS;
  const phase = (days % SYNODIC_MONTH_DAYS) / SYNODIC_MONTH_DAYS;
  return phase < 0 ? phase + 1 : phase;
}
function isFullMoon(date: Date): boolean {
  const phase = moonPhase(date);
  return Math.abs(phase - 0.5) < 0.045; // ~2.7 real days around full moon
}

function nextMatchingDayLabel(date: Date, matches: (d: Date) => boolean, maxDays = 30): string {
  for (let i = 1; i <= maxDays; i++) {
    const candidate = new Date(date.getTime() + i * DAY_MS);
    if (matches(candidate)) {
      if (i === 1) return "back tomorrow";
      if (i <= 6) return `back in ${i} days`;
      return `back on ${candidate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}`;
    }
  }
  return "back soon";
}

export function getScheduleStatus(villagerId: ScheduledVillagerId, now: Date = new Date()): ScheduleStatus {
  if (villagerId === "shelldon") {
    const available = isShelldonDay(now);
    return {
      available,
      presentLabel: "Here today — happy Shelldon Sunday! 🐢",
      awayLabel: `Away until next Sunday (${nextMatchingDayLabel(now, isShelldonDay)}).`,
    };
  }
  if (villagerId === "shelby") {
    const available = isTradingShipDay(now);
    return {
      available,
      presentLabel: "The Trading Ship has docked — here today! 🦀⚓",
      awayLabel: `Out at sea — ${nextMatchingDayLabel(now, isTradingShipDay)}.`,
    };
  }
  // misty
  const available = isFullMoon(now);
  return {
    available,
    presentLabel: "Full moon tonight — glowing in the shallows! 🌕🫩",
    awayLabel: `Only seen on full moon nights — ${nextMatchingDayLabel(now, isFullMoon)}.`,
  };
}

export const SCHEDULED_VILLAGER_IDS: ScheduledVillagerId[] = ["shelldon", "shelby", "misty"];
