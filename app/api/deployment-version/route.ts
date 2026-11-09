import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  let commit = "unknown";
  let buildId = "unknown";
  try { commit = (await readFile(join(process.cwd(), "deploy-commit.txt"), "utf8")).trim(); } catch {}
  try { buildId = (await readFile(join(process.cwd(), ".next", "BUILD_ID"), "utf8")).trim(); } catch {}
  return Response.json(
    { commit, buildId, uptimeSeconds: Math.floor(process.uptime()) },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
