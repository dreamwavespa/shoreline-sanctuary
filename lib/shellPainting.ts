export const PAINTABLE_SHELL_IDS = [
  "shell-scallop",
  "shell-whelk",
  "shell-cowrie",
  "shell-clam",
  "shell-conch",
  "shell-abalone",
] as const;

export const SHELL_PAINT_COLORS = ["Coral Pink", "Sea-Glass Teal", "Sunny Yellow", "Soft Lavender"] as const;
export const BASIC_SHELL_PATTERNS = ["Solid Wash", "Seafoam Dots"] as const;
export const SUNNY_QUEST_PATTERN = "Pastel Wave";
export const NOTEBOOK_SHELL_PATTERNS = ["Pastel Garden", "Sunset Scallops"] as const;

export function defaultPaintedShellName(shellName: string, pattern: string): string {
  return `${pattern} ${shellName}`;
}
