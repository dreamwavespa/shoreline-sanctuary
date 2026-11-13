import { NextRequest, NextResponse } from "next/server";
import { checkShowcasePassword, createShowcaseSession, SHOWCASE_COOKIE, showcaseConfigured } from "@/lib/showcaseAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: NextRequest) {
  if (!showcaseConfigured()) return NextResponse.json({ error: "Showcase is not configured on the server." }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const previous = attempts.get(ip);
  if (previous && previous.until > now && previous.count >= 5) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" && body.password.length <= 256 ? body.password : "";
  if (!checkShowcasePassword(password)) {
    const count = previous && previous.until > now ? previous.count + 1 : 1;
    attempts.set(ip, { count, until: now + 15 * 60_000 });
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  attempts.delete(ip);
  const session = createShowcaseSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SHOWCASE_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/showcase", maxAge: session.maxAge });
  return response;
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SHOWCASE_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/showcase", maxAge: 0 });
  return response;
}
