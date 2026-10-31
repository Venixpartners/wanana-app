import { NextResponse, type NextRequest } from "next/server";
import { cleanQuery, searchCatalogue } from "@/features/search/queries";

/** Used by the ranking editor to find artists, releases and songs as you type. */
export async function GET(request: NextRequest) {
  const q = cleanQuery(request.nextUrl.searchParams.get("q") ?? "");
  const { artists, releases, tracks } = await searchCatalogue(q, 5);
  return NextResponse.json({ results: [...tracks, ...releases, ...artists] }, { headers: { "Cache-Control": "private, max-age=30" } });
}
