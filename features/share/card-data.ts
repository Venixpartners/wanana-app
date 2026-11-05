import { createClient } from "@/lib/supabase/server";
import { getArtistPage, getReleasePage, getTrackPage } from "@/features/catalogue/queries";
import { artVariant } from "@/features/catalogue/slug";
import { KIND_LABEL } from "@/features/catalogue/format";
import { getPoll } from "@/features/polls/queries";
import { percentages } from "@/features/polls/schema";
import { getRanking } from "@/features/rankings/queries";
import { getReview } from "@/features/reviews/queries";
import { fanPulse, getChart, type Pulse } from "@/features/pulse/queries";
import { CHART_INFO, isChart, pulseWord } from "@/features/pulse/charts";
import { isUuid, plural } from "@/lib/text";
import { getBattle, getBracket } from "@/features/versus/queries";
import { roundName, split } from "@/features/versus/rounds";
import { getVerdict, isFriday, lastVerdictFriday, verdictDateText } from "@/features/verdict/queries";
import { getWrapped } from "@/features/wrapped/queries";
import { parsePeriod } from "@/features/wrapped/periods";
import { site } from "@/lib/site";
import type { CardData } from "./card";

function pulseParts(p: Pulse): Pick<CardData, "score" | "split"> {
  if (!p.all) return {};
  return {
    score: { value: String(p.all.pulse), unit: "/ 100 Fan Pulse", label: pulseWord(p.all.pulse) },
    split: { home: p.home?.pulse ?? null, diaspora: p.diaspora?.pulse ?? null },
  };
}

async function song(slug: string): Promise<CardData | null> {
  const data = await getTrackPage(slug);
  if (!data?.track.is_published) return null;
  const p = await fanPulse("track", data.track.id);
  return {
    eyebrow: p.all ? `Song · ${plural(p.all.ratings, "fan score")}` : "Song",
    title: data.track.title,
    subtitle: data.artist.name,
    ...pulseParts(p),
    cta: p.all ? "Add your score on" : "Be the first to score it on",
    art: artVariant(data.release?.slug ?? data.track.slug),
  };
}

async function album(slug: string): Promise<CardData | null> {
  const data = await getReleasePage(slug);
  if (!data?.release.is_published) return null;
  const p = await fanPulse("release", data.release.id);
  return {
    eyebrow: KIND_LABEL[data.release.kind],
    title: data.release.title,
    subtitle: data.artist.name,
    ...pulseParts(p),
    cta: p.all ? "Add your score on" : "Be the first to score it on",
    art: artVariant(data.release.slug),
  };
}

async function artist(slug: string): Promise<CardData | null> {
  const data = await getArtistPage(slug);
  if (!data?.artist.is_published) return null;
  const p = await fanPulse("artist", data.artist.id);
  return {
    eyebrow: "Artist",
    title: data.artist.name,
    subtitle: data.artist.genres.slice(0, 3).join(", ") || undefined,
    ...pulseParts(p),
    cta: "See what fans think on",
    art: artVariant(data.artist.slug),
  };
}

async function poll(id: string): Promise<CardData | null> {
  if (!isUuid(id)) return null;
  const p = await getPoll(id, null);
  if (!p || p.is_removed) return null;
  // Vote to see: open polls never show results on a card.
  const pct = percentages(p.options.map((o) => o.vote_count));
  const order = p.options.map((o, i) => ({ o, pct: pct[i] })).sort((a, b) => (p.closed ? b.o.vote_count - a.o.vote_count : a.o.position - b.o.position));
  return {
    eyebrow: p.closed ? `Poll result · ${plural(p.vote_count, "vote")}` : "Poll · vote to see the results",
    title: p.question,
    lines: order.map(({ o, pct: v }) => (p.closed ? { label: o.label, value: `${v}%`, bar: v } : { label: o.label })),
    cta: p.closed ? "See the full result on" : "Vote on",
    art: artVariant(p.id),
  };
}

async function ranking(id: string): Promise<CardData | null> {
  if (!isUuid(id)) return null;
  const r = await getRanking(id);
  if (!r?.ranking.is_public) return null;
  return {
    eyebrow: `Ranking${r.author ? ` by @${r.author.handle}` : ""}`,
    title: r.ranking.title,
    lines: r.items.filter((i) => i.subject).slice(0, 5).map((i) => ({ label: `${i.position}. ${i.subject!.name}` })),
    cta: "Agree? Make your own on",
    art: artVariant(r.ranking.id),
  };
}

async function review(id: string): Promise<CardData | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data: allowed } = await supabase.rpc("review_card_allowed", { p_review: id });
  if (allowed !== true) return null;
  const got = await getReview(id, null);
  if (!got) return null;
  const rv = got.review;
  return {
    eyebrow: `Review${rv.author ? ` by @${rv.author.handle}` : ""}${rv.author?.badges?.includes("voice") ? " · Wanana Voice" : ""}`,
    title: rv.title ?? rv.subject?.name ?? "A Wanana review",
    subtitle: rv.title ? rv.subject?.name : undefined,
    score: { value: String(rv.rating), unit: "/ 10", label: rv.audience === "diaspora" ? "Diaspora fan" : rv.audience === "home" ? "Home fan" : "Fan" },
    quote: rv.body ?? undefined,
    cta: "Read it and reply on",
    art: artVariant(rv.subject?.slug ?? rv.id),
  };
}

async function chart(name: string): Promise<CardData | null> {
  if (!isChart(name)) return null;
  const entries = await getChart(name, 5);
  return {
    eyebrow: "Wanana Charts · this week",
    title: CHART_INFO[name].title,
    subtitle: "Ranked by what fans think",
    lines: entries.length ? entries.map((e) => ({ label: `${e.position}. ${e.track.title}${e.artist ? `, ${e.artist.name}` : ""}`, value: String(e.pulse) })) : [{ label: "The chart fills as fans score songs" }],
    cta: "See the full chart on",
    art: 3,
  };
}

async function versus(key: string): Promise<CardData | null> {
  if (key.startsWith("bracket/")) {
    const data = await getBracket(key.slice(8), null);
    if (!data) return null;
    const { bracket: b, battles, champion } = data;
    const live = battles.filter((x) => x.round === b.current_round);
    return {
      eyebrow: champion ? "Versus · fans have decided" : `Versus · ${roundName(b.size, b.current_round)}`,
      title: b.title,
      subtitle: champion ? `Winner: ${champion.title}${champion.artist ? `, ${champion.artist}` : ""}` : `${b.size} ${b.kind === "track" ? "songs" : "releases"}, one left standing`,
      lines: champion ? undefined : live.map((x) => ({ label: `${x.a?.title ?? "?"} v ${x.b?.title ?? "?"}` })),
      cta: champion ? "See every round on" : "Pick your side on",
      art: artVariant(b.slug),
    };
  }
  const data = await getBattle(key, null);
  if (!data) return null;
  const { battle: b, bracket } = data;
  const sides = [b.a, b.b];
  const pct = split(b.a_votes, b.b_votes);
  return {
    eyebrow: b.closed ? `Versus result · ${plural(b.a_votes + b.b_votes, "vote")}` : "Versus · vote to see the result",
    title: b.title ?? `${b.a?.title ?? "Side A"} v ${b.b?.title ?? "Side B"}`,
    subtitle: bracket && b.round ? `${bracket.title}, ${roundName(bracket.size, b.round).toLowerCase()}` : undefined,
    // Vote to see: open battles never show the count on a card.
    lines: sides.map((x, i) => ({ label: `${x?.title ?? "Removed"}${x?.artist ? `, ${x.artist}` : ""}`, ...(b.closed ? { value: `${pct[i]}%`, bar: pct[i] } : {}) })),
    cta: b.closed ? "See how home and diaspora voted on" : "Pick a side on",
    art: b.a?.art ?? 0,
  };
}

async function verdict(key: string): Promise<CardData | null> {
  const friday = key === "latest" ? await lastVerdictFriday() : key;
  if (!friday || !isFriday(friday)) return null;
  const { entries } = await getVerdict(friday);
  return {
    eyebrow: "Fan Verdict",
    title: `Week of ${verdictDateText(friday)}`,
    subtitle: "New releases, ranked by fan scores",
    lines: entries.length
      ? entries.slice(0, 5).map((e) => ({ label: `${e.position}. ${e.release?.title ?? "Removed"}${e.release?.artist ? `, ${e.release.artist}` : ""}`, value: String(e.pulse) }))
      : [{ label: "No release reached three fan scores" }],
    cta: "Score this week's releases on",
    art: 2,
  };
}

async function wrapped(key: string): Promise<CardData | null> {
  const [handle, periodKey] = key.split("/");
  const period = periodKey ? parsePeriod(periodKey) : null;
  if (!handle || !period) return null;
  const w = await getWrapped(handle, period);
  if (!w) return null;
  const agree = [w.agree_home !== null ? `home fans ${w.agree_home}%` : null, w.agree_diaspora !== null ? `the diaspora ${w.agree_diaspora}%` : null].filter(Boolean);
  return {
    eyebrow: `Wanana Wrapped · ${period.label}`,
    title: `${w.person.display_name}`,
    subtitle: agree.length ? `Agrees with ${agree.join(", ")}` : `@${w.person.handle}`,
    score: { value: w.scores.toLocaleString("en-GB"), unit: w.scores === 1 ? "score given" : "scores given", label: w.average !== null ? `Average ${w.average.toFixed(1)}` : "Just getting started" },
    lines: w.top.slice(0, 3).map((t, i) => ({ label: `${i + 1}. ${t.title}${t.by ? `, ${t.by}` : ""}`, value: String(t.rating) })),
    cta: "Get your own Wrapped on",
    art: 4,
  };
}

async function join(handle: string): Promise<CardData | null> {
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) return null;
  const supabase = await createClient();
  const { data: p } = await supabase.from("profiles").select("handle, display_name").eq("handle", handle).maybeSingle();
  if (!p) return null;
  return {
    eyebrow: "You're invited",
    title: `${p.display_name} invited you to Wanana`,
    subtitle: site.tagline,
    lines: [{ label: "Score songs and albums out of 10" }, { label: "See how home and diaspora fans differ" }, { label: "Vote in Versus battles and polls" }],
    cta: "Join on",
    art: 0,
  };
}

const LOADERS: Record<string, (key: string) => Promise<CardData | null>> = {
  wrapped,
  join,
  versus,
  verdict,
  song,
  album,
  artist,
  polls: poll,
  rankings: ranking,
  reviews: review,
  charts: chart,
};

/** Card content for a Wanana path such as /song/ojuelegba or /charts/fan. */
export async function cardFor(section: string, key: string): Promise<CardData | null> {
  const load = LOADERS[section];
  if (!load || !key || key.length > 130) return null;
  try {
    return await load(key);
  } catch (e) {
    console.error("card data failed", section, (e as Error).message);
    return null;
  }
}
