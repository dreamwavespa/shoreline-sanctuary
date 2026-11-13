import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SHOWCASE_COOKIE = "shoreline_showcase";
const MAX_AGE = 60 * 60 * 4;

export function showcaseConfigured() {
  return Boolean(process.env.SHOWCASE_PASSWORD && process.env.SHOWCASE_SESSION_SECRET && process.env.SHOWCASE_SESSION_SECRET.length >= 32);
}

function sign(value: string) {
  return createHmac("sha256", process.env.SHOWCASE_SESSION_SECRET!).update(value).digest("hex");
}

export function checkShowcasePassword(password: string) {
  if (!showcaseConfigured()) return false;
  const expected = createHmac("sha256", process.env.SHOWCASE_SESSION_SECRET!).update(process.env.SHOWCASE_PASSWORD!).digest();
  const supplied = createHmac("sha256", process.env.SHOWCASE_SESSION_SECRET!).update(password).digest();
  return timingSafeEqual(expected, supplied);
}

export function createShowcaseSession() {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  return { value: expires + "." + sign(expires), maxAge: MAX_AGE };
}

export function validShowcaseSession(value?: string) {
  if (!showcaseConfigured() || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 2 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1])) return false;
  const expiry = Number(parts[0]);
  if (!Number.isSafeInteger(expiry) || expiry <= Date.now() / 1000 || expiry > Date.now() / 1000 + MAX_AGE) return false;
  return timingSafeEqual(Buffer.from(parts[1], "hex"), Buffer.from(sign(parts[0]), "hex"));
}
