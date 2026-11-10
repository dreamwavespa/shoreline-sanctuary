import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function readOptionalFile(path: string): string | null {
  try {
    return readFileSync(path, "utf8").trim() || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const root = process.cwd();
  return NextResponse.json(
    {
      commit: readOptionalFile(join(root, "deploy-commit.txt")),
      buildId: readOptionalFile(join(root, ".next", "BUILD_ID")),
      uptimeSeconds: Math.floor(process.uptime()),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
