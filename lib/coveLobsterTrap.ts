export const TRAP_DESTINATIONS = {
  "Hermit crab": "Sheltered Cove rocks",
  "Sea snail": "Shallow Tide Pool",
  Starfish: "Shallow Tide Pool",
  Lobster: "Libby’s Reef",
} as const;

export type TrapCreature = keyof typeof TRAP_DESTINATIONS;

export interface CoveLobsterTrap {
  placed: boolean;
  checked: string;
  creature: TrapCreature | "";
  releasedAnimals: TrapCreature[];
  releases: number;
  seedPacketsOpened: number;
}

export const EMPTY_COVE_LOBSTER_TRAP: CoveLobsterTrap = {
  placed: false,
  checked: "",
  creature: "",
  releasedAnimals: [],
  releases: 0,
  seedPacketsOpened: 0,
};

function isTrapCreature(value: unknown): value is TrapCreature {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(TRAP_DESTINATIONS, value);
}

export function readLegacyCoveLobsterTrap(storage: Pick<Storage, "getItem">): CoveLobsterTrap {
  try {
    const oldTrap = JSON.parse(storage.getItem("shoreline-cove-lobster-trap-v1") || "{}") || {};
    const oldAnimals: unknown = JSON.parse(storage.getItem("shoreline-rescued-trap-animals-v1") || "[]");
    const releasedAnimals = Array.isArray(oldAnimals) ? Array.from(new Set(oldAnimals.filter(isTrapCreature))) : [];
    return {
      placed: !!oldTrap.placed,
      checked: typeof oldTrap.checked === "string" ? oldTrap.checked : "",
      creature: isTrapCreature(oldTrap.creature) ? oldTrap.creature : "",
      releasedAnimals,
      releases: releasedAnimals.length,
      seedPacketsOpened: 0,
    };
  } catch {
    return EMPTY_COVE_LOBSTER_TRAP;
  }
}

export function nextTrapReleaseMilestone(releases: number) {
  return releases < 10 ? 10 : (Math.floor(releases / 20) + 1) * 20;
}

export function pendingShelbySeedPackets(trap: CoveLobsterTrap) {
  return Math.max(0, Math.floor(trap.releases / 20) - trap.seedPacketsOpened);
}

export const SHELBY_PACKET_SEEDS = ["seed-beach-rose", "seed-sea-holly", "seed-seaside-daisy"] as const;
