import { createClient } from "@/lib/supabase/server";
import { fanPulse, getChart } from "@/features/pulse/queries";
import { CHART_INFO, type ChartName } from "@/features/pulse/charts";
import { listReviews } from "@/features/reviews/queries";
import { listDiscussions } from "@/features/discussions/queries";
import { getVerdict, lastVerdictFriday, verdictDateText } from "@/features/verdict/queries";
import type { SubjectKind } from "@/features/community/subjects";
import type { Source } from "./answer";

type Found = { kind: SubjectKind; id: string; slug: string; name: string; artist_id: string };

const PATH: Record<SubjectKind, string> = { artist: "/artist/", release: "/album/", track: "/song/" };
const TYPE: Record<SubjectKind, Source["type"]> = { artist: "artist", release: "album", track: "song" };

function clip(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/**
 * Gathers the Wanana data an answer may use, as numbered sources plus a plain text brief for the model.
 * Everything here is already public on Wanana.
 */
export async function buildContext(question: string): Promise<{ sources: Source[]; brief: string; subjects: Found[] }> {
  const supabase = await createClient();
  const sources: Source[] = [];
  const lines: string[] = [];
  const add = (s: Omit<Source, "id">) => {
    const id = `S${sources.length + 1}`;
    sources.push({ id, ...s });
    return id;
  };

  const { data: found } = await supabase.rpc("find_subjects", { p_text: question, p_limit: 4 });
  const subjects = (found ?? []) as Found[];
  const { data: artistRows } = subjects.length ? await supabase.from("artists").select("id, name").in("id", Array.from(new Set(subjects.map((s) => s.artist_id)))) : { data: [] };
  const artistName = new Map(((artistRows ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));

  // What the question names.
  for (const s of subjects) {
    const [pulse, reviews, discussions] = await Promise.all([
      fanPulse(s.kind, s.id),
      listReviews({ subject: { kind: s.kind, id: s.id }, sort: "helpful", limit: 3 }),
      listDiscussions({ subject: { kind: s.kind, id: s.id }, limit: 3 }),
    ]);
    const by = s.kind === "artist" ? null : (artistName.get(s.artist_id) ?? null);
    const sid = add({ type: TYPE[s.kind], title: by ? `${s.name}, ${by}` : s.name, url: `${PATH[s.kind]}${s.slug}` });
    lines.push(`[${sid}] ${TYPE[s.kind]} "${s.name}"${by ? ` by ${by}` : ""}.`);
    if (pulse.all) {
      lines.push(
        `  Fan Pulse ${pulse.all.pulse}/100 from ${pulse.all.ratings} scores, average ${pulse.all.average}/10. Home ${pulse.home ? `${pulse.home.pulse} (${pulse.home.ratings} scores)` : "no scores"}. Diaspora ${pulse.diaspora ? `${pulse.diaspora.pulse} (${pulse.diaspora.ratings} scores)` : "no scores"}. ${pulse.all.ratings_7d} new scores this week, ${pulse.all.ratings_prev_7d} the week before.`,
      );
    } else {
      lines.push("  No fan scores yet.");
    }
    for (const r of reviews) {
      const rid = add({ type: "review", title: r.title ?? `${r.rating}/10 review of ${s.name}`, url: `/reviews/${r.id}`, detail: r.author ? `@${r.author.handle}` : undefined });
      lines.push(`  [${rid}] Review, ${r.rating}/10, ${r.audience ?? "unknown"} fan, ${r.helpful_count} found it helpful: "${clip(`${r.title ? `${r.title}. ` : ""}${r.body ?? ""}`, 400)}"`);
    }
    for (const d of discussions) {
      const did = add({ type: "discussion", title: d.title, url: `/community/${d.id}`, detail: `${d.reply_count} replies` });
      lines.push(`  [${did}] Discussion with ${d.reply_count} replies: "${clip(d.title, 160)}"`);
    }
  }

  // The state of Wanana right now.
  const charts: ChartName[] = ["fan", "nigeria", "diaspora", "rising"];
  const [entries, friday] = await Promise.all([Promise.all(charts.map((c) => getChart(c, c === "rising" ? 5 : 10))), lastVerdictFriday()]);
  charts.forEach((c, i) => {
    const list = entries[i];
    if (!list.length) return;
    const cid = add({ type: "chart", title: CHART_INFO[c].title, url: `/charts/${c}` });
    lines.push(`[${cid}] ${CHART_INFO[c].title} (${CHART_INFO[c].about})`);
    for (const e of list) {
      lines.push(`  ${e.position}. "${e.track.title}"${e.artist ? ` by ${e.artist.name}` : ""}, Fan Pulse ${e.pulse}, ${e.ratings} scores${e.last_position ? `, was ${e.last_position}` : ", new"}.`);
    }
  });
  if (friday) {
    const v = await getVerdict(friday);
    if (v.entries.length) {
      const vid = add({ type: "verdict", title: `Fan Verdict, week of ${verdictDateText(friday)}`, url: `/verdict/${friday}` });
      lines.push(`[${vid}] Fan Verdict for releases out in the week to ${verdictDateText(friday)}:`);
      for (const e of v.entries.slice(0, 5)) {
        lines.push(`  ${e.position}. "${e.release?.title ?? "?"}"${e.release?.artist ? ` by ${e.release.artist}` : ""}, Fan Pulse ${e.pulse}, home ${e.home_pulse ?? "none"}, diaspora ${e.diaspora_pulse ?? "none"}.`);
      }
    }
  }

  const brief = lines.length ? lines.join("\n") : "There is no fan data on Wanana yet.";
  return { sources, brief, subjects };
}
