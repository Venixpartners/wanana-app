import { renderBadge } from "@/features/share/card";
import { isKitKind, scoreFor } from "@/features/share/badge-data";

/** Live Fan Pulse badge image: /badge/song/slug, /badge/album/slug or /badge/artist/slug. */
export async function GET(_request: Request, { params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  if (!isKitKind(kind)) return new Response("Not found", { status: 404 });
  const score = await scoreFor(kind, slug);
  if (!score) return new Response("Not found", { status: 404 });
  return renderBadge(score);
}
