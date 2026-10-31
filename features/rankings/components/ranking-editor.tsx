"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { saveRankingAction, type RankingState } from "../actions";

type Entry = { kind: "artist" | "release" | "track"; id: string; name: string; detail?: string | null; note?: string };
const KIND: Record<Entry["kind"], string> = { artist: "Artist", release: "Release", track: "Song" };

export function RankingEditor({
  initial,
}: {
  initial?: { id: string; title: string; description: string | null; is_public: boolean; items: Entry[] };
}) {
  const [state, action, pending] = useActionState<RankingState, FormData>(saveRankingAction, { status: "idle" });
  const [items, setItems] = useState<Entry[]>(initial?.items ?? []);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const f = state.fields ?? {};

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/catalogue-search?q=${encodeURIComponent(q.trim())}`);
        const json = (await res.json()) as { results: Entry[] };
        setResults(json.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
  }, [q]);

  const has = (e: Entry) => items.some((i) => i.kind === e.kind && i.id === e.id);
  const add = (e: Entry) => {
    if (has(e) || items.length >= 50) return;
    setItems((cur) => [...cur, { kind: e.kind, id: e.id, name: e.name, detail: e.detail }]);
    setQ("");
  };
  const move = (i: number, by: number) =>
    setItems((cur) => {
      const next = [...cur];
      const j = i + by;
      if (j < 0 || j >= next.length) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form action={action} className="grid gap-5" noValidate>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="items" value={JSON.stringify(items.map(({ kind, id, note }) => ({ kind, id, note })))} />
      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input id="title" name="title" maxLength={120} defaultValue={initial?.title} className="field" placeholder="Top 10 Afrobeats albums of 2026" />
        {f.title && <p role="alert" className="mt-1.5 text-sm text-orange">{f.title}</p>}
      </div>
      <div>
        <label htmlFor="description" className="label">
          Description (optional)
        </label>
        <textarea id="description" name="description" rows={3} maxLength={600} defaultValue={initial?.description ?? ""} className="field" />
        {f.description && <p role="alert" className="mt-1.5 text-sm text-orange">{f.description}</p>}
      </div>

      <div>
        <label htmlFor="find" className="label">
          Add artists, releases or songs
        </label>
        <input id="find" type="search" value={q} onChange={(e) => setQ(e.target.value)} className="field" placeholder="Start typing a name" autoComplete="off" />
        {q.trim().length >= 2 && (
          <ul className="mt-2 divide-y divide-line/70 rounded-xl border border-line bg-ink" aria-live="polite">
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-mist">{searching ? "Searching…" : "Nothing found in the catalogue yet."}</li>
            ) : (
              results.map((r) => (
                <li key={`${r.kind}:${r.id}`}>
                  <button type="button" onClick={() => add(r)} disabled={has(r)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-midnight/40 disabled:opacity-50">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.name}</span>
                      <span className="block truncate text-mist">{[KIND[r.kind], r.detail].filter(Boolean).join(", ")}</span>
                    </span>
                    <span className="shrink-0 text-mist">{has(r) ? "Added" : "Add"}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div>
        <p className="label">Your list</p>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-4 text-sm text-mist">Search above to add your first entry.</p>
        ) : (
          <ol className="grid gap-2">
            {items.map((it, i) => (
              <li key={`${it.kind}:${it.id}`} className="rounded-xl border border-line bg-ink p-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-display font-semibold tabular-nums text-gold">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{it.name}</span>
                    <span className="block truncate text-xs text-mist">{[KIND[it.kind], it.detail].filter(Boolean).join(", ")}</span>
                  </span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${it.name} up`} className="rounded p-1.5 text-mist hover:text-paper disabled:opacity-30">
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${it.name} down`} className="rounded p-1.5 text-mist hover:text-paper disabled:opacity-30">
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))} aria-label={`Remove ${it.name}`} className="rounded p-1.5 text-mist hover:text-orange">
                    <X size={16} />
                  </button>
                </div>
                <label className="sr-only" htmlFor={`note-${i}`}>
                  Note for {it.name}
                </label>
                <input
                  id={`note-${i}`}
                  value={it.note ?? ""}
                  maxLength={280}
                  onChange={(e) => setItems((cur) => cur.map((c, j) => (j === i ? { ...c, note: e.target.value } : c)))}
                  className="field mt-2 py-2 text-sm"
                  placeholder="Why it's here (optional)"
                />
              </li>
            ))}
          </ol>
        )}
        {f.items && <p role="alert" className="mt-2 text-sm text-orange">{f.items}</p>}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="is_public" defaultChecked={initial?.is_public ?? true} className="size-4 accent-[#0E7C66]" />
        Public, anyone can see and share it
      </label>
      {state.message && <p role="alert" className="text-sm text-orange">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn sm:justify-self-start">
        {pending ? "Saving…" : initial ? "Save changes" : "Publish list"}
      </button>
    </form>
  );
}
