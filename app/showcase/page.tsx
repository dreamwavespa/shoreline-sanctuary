import { cookies } from "next/headers";
import { SHOWCASE_COOKIE, validShowcaseSession, showcaseConfigured } from "@/lib/showcaseAuth";
import ShowcaseClient from "./ShowcaseClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Private Showcase | Shoreline Sanctuary", robots: { index: false, follow: false } };

export default async function ShowcasePage() {
  const cookieStore = await cookies();
  const authenticated = validShowcaseSession(cookieStore.get(SHOWCASE_COOKIE)?.value);
  return <ShowcaseClient authenticated={authenticated} configured={showcaseConfigured()} />;
}
