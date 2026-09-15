export const CADENCE_DUCKY_KEY = "shoreline-cadence-ducky-rescued";

export function isCadenceDuckyRescued() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CADENCE_DUCKY_KEY) === "yes";
}

export function rescueCadenceDucky() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CADENCE_DUCKY_KEY, "yes");
  window.dispatchEvent(new Event("shoreline:cadence-ducky"));
}

export function clearCadenceDuckyRescue() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CADENCE_DUCKY_KEY);
}
