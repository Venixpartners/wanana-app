import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/features/catalogue/admin/admin-shell";
import { KIND_LABEL, releaseYear } from "@/features/catalogue/format";

export const metadata: Metadata = { title: "Catalogue admin", robots: { index: false } };

const SAVED: Record<string, { label: string; path: string }> = {
  artist: { label: "Artist saved.", path: "/artist/" },
  release: { label: "Release saved.", path: "/album/" },
  song: { label: "Song saved.", path: "/song/" },
};

function List({ title, addHref, addLabel, rows }: { title: string; addHref: string; addLabel: string; rows: { id: string; href: string; name: string; meta: string; draft: boolean }[] }) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <Link href={addHref} className="btn-quiet">
          {addLabel}
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-mist">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-line/70 rounded-2xl border border-line bg-ink">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={r.href} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-midnight/40 sm:px-5">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block truncate text-sm text-mist">{r.meta}</span>
                </span>
                {r.draft && <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs text-mist">Draft</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function CatalogueAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; slug?: string }> }) {
  const { supabase } = await requireAdmin();
  const { saved, slug } = await searchParams;

  const [{ data: artists }, { data: releases }, { data: tracks }] = await Promise.all([
    supabase.from("artists").select("id, name, genres, is_published").order("updated_at", { ascending: false }).limit(50),
    supabase.from("releases").select("id, title, kind, release_date, artist_id, is_published").order("updated_at", { ascending: false }).limit(50),
    supabase.from("tracks").select("id, title, artist_id, isrc, is_published").order("updated_at", { ascending: false }).limit(50),
  ]);
  const ids = Array.from(new Set([...(releases ?? []), ...(tracks ?? [])].map((r) => r.artist_id)));
  const { data: names } = ids.length ? await supabase.from("artists").select("id, name").in("id", ids) : { data: [] };
  const nameOf = new Map((names ?? []).map((a) => [a.id, a.name]));
  const done = saved && SAVED[saved];

  return (
    <AdminShell title="Catalogue">
      {done && slug && /^[a-z0-9-]+$/.test(slug) && (
        <p role="status" className="mb-8 rounded-lg border border-emerald/60 bg-emerald/10 p-3 text-sm">
          {done.label}{" "}
          <Link href={`${done.path}${slug}`} className="underline underline-offset-4">
            View the page
          </Link>
        </p>
      )}
      <p className="text-mist">
        Add and edit artists, releases and songs by hand. When the Deezer, YouTube, MusicBrainz and Last.fm connectors arrive they will fill in the same records automatically, matched on ISRC.
      </p>
      <div className="mt-8">
        <List
          title="Artists"
          addHref="/admin/catalogue/artists/new"
          addLabel="Add artist"
          rows={(artists ?? []).map((a) => ({ id: a.id, href: `/admin/catalogue/artists/${a.id}`, name: a.name, meta: (a.genres ?? []).join(", ") || "No genres yet", draft: !a.is_published }))}
        />
        <List
          title="Releases"
          addHref="/admin/catalogue/releases/new"
          addLabel="Add release"
          rows={(releases ?? []).map((r) => ({
            id: r.id,
            href: `/admin/catalogue/releases/${r.id}`,
            name: r.title,
            meta: [nameOf.get(r.artist_id), KIND_LABEL[r.kind], releaseYear(r.release_date)].filter(Boolean).join(", "),
            draft: !r.is_published,
          }))}
        />
        <List
          title="Songs"
          addHref="/admin/catalogue/songs/new"
          addLabel="Add song"
          rows={(tracks ?? []).map((t) => ({
            id: t.id,
            href: `/admin/catalogue/songs/${t.id}`,
            name: t.title,
            meta: [nameOf.get(t.artist_id), t.isrc].filter(Boolean).join(", "),
            draft: !t.is_published,
          }))}
        />
      </div>
    </AdminShell>
  );
}
