import { renderCard } from "@/features/share/card";
import { cardFor } from "@/features/share/card-data";

/** Share card images. /card/song/slug gives the wide card; add ?size=story for Instagram and TikTok stories. */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.length < 2 || path.length > 3) return new Response("Not found", { status: 404 });
  const data = await cardFor(path[0], path.slice(1).join("/"));
  if (!data) return new Response("Not found", { status: 404 });
  const size = new URL(request.url).searchParams.get("size") === "story" ? "story" : "wide";
  return renderCard(data, size);
}
