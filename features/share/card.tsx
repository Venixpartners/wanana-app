import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Share cards: Wanana's own artwork, scores and words only. No real cover art, no audio.

export type CardSize = "wide" | "story";
export const CARD_SIZES: Record<CardSize, { width: number; height: number }> = {
  wide: { width: 1200, height: 630 },
  story: { width: 1080, height: 1920 },
};

export type CardData = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  score?: { value: string; unit: string; label: string };
  split?: { home: number | null; diaspora: number | null };
  lines?: { label: string; value?: string; bar?: number }[];
  quote?: string;
  cta: string;
  art: number;
};

const C = { midnight: "#0B0F13", ink: "#12181E", line: "#222B33", mist: "#8A949C", paper: "#F6F4EF", emerald: "#0E7C66", bright: "#19A486", orange: "#FF6A3D", gold: "#F4B942" };
const PALETTES = [
  [C.emerald, C.gold, C.orange],
  [C.orange, C.emerald, C.paper],
  [C.gold, C.orange, C.midnight],
  [C.bright, C.midnight, C.gold],
  [C.paper, C.emerald, C.orange],
];

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" }[]> | null = null;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/sora-latin-600-normal.woff")).then((data) => ({ name: "Sora", data, weight: 600 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "assets/fonts/inter-latin-400-normal.woff")).then((data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const })),
    readFile(join(process.cwd(), "assets/fonts/inter-latin-500-normal.woff")).then((data) => ({ name: "Inter", data, weight: 500 as const, style: "normal" as const })),
  ]);
  return fonts;
}

function Art({ variant, size }: { variant: number; size: number }) {
  const [a, b, c] = PALETTES[variant % PALETTES.length];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: size / 10 }}>
      <rect width="100" height="100" fill={a} />
      <circle cx={30 + variant * 9} cy={62 - variant * 5} r="46" fill={b} />
      <circle cx={30 + variant * 9} cy={62 - variant * 5} r="22" fill={a} />
      <path d="M8 70 H28 L36 52 L45 80 L54 61 L63 80 L72 52 L80 70 H92" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo({ height }: { height: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: height * 0.45 }}>
      <svg width={height * (200 / 68)} height={height} viewBox="0 6 200 68">
        <path d="M6 48 H46 L62 12 L80 68 L98 30 L116 68 L134 12 L150 48 H180" fill="none" stroke={C.emerald} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="192" cy="48" r="6" fill={C.orange} />
      </svg>
      <span style={{ fontFamily: "Sora", fontSize: height * 0.8, color: C.paper, letterSpacing: -1 }}>wanana</span>
    </div>
  );
}

function Bar({ label, value, color, scale }: { label: string; value: number | null; color: string; scale: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 * scale, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 * scale, color: C.mist }}>
        <span>{label}</span>
        <span style={{ color: C.paper, fontFamily: "Sora" }}>{value ?? "No scores"}</span>
      </div>
      <div style={{ display: "flex", height: 12 * scale, borderRadius: 99, background: C.line }}>
        {value !== null && <div style={{ width: `${value}%`, height: "100%", borderRadius: 99, background: color }} />}
      </div>
    </div>
  );
}

function clip(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

function Body({ d, story }: { d: CardData; story: boolean }) {
  const s = story ? 1.35 : 1;
  // The wide card has little height, so busy cards get a smaller title and score.
  const busy = !story && (!!d.lines || !!d.quote);
  const titleSize = (busy ? 44 : d.title.length > 40 ? 50 : 60) * s;
  const keep = { flexShrink: 0 } as const;
  const lines = d.lines?.slice(0, story ? 5 : d.lines.length > 4 ? 4 : d.lines.length) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
      <span style={{ ...keep, fontSize: 22 * s, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 500 }}>{d.eyebrow}</span>
      <span style={{ ...keep, fontFamily: "Sora", fontSize: titleSize, lineHeight: 1.12, color: C.paper, marginTop: 12 * s, letterSpacing: -1 }}>{clip(d.title, story ? 90 : busy ? 56 : 70)}</span>
      {d.subtitle && <span style={{ ...keep, fontSize: (busy ? 24 : 28) * s, color: C.mist, marginTop: 10 * s }}>{clip(d.subtitle, 60)}</span>}

      {d.score && (
        <div style={{ ...keep, display: "flex", alignItems: "baseline", gap: 14 * s, marginTop: (busy ? 16 : 28) * s }}>
          <span style={{ fontFamily: "Sora", fontSize: (busy ? 76 : 110) * s, lineHeight: 1, color: C.paper }}>{d.score.value}</span>
          <span style={{ fontSize: 28 * s, color: C.mist }}>{d.score.unit}</span>
          <span style={{ fontSize: 22 * s, color: C.gold, marginLeft: 10 * s, border: `2px solid ${C.line}`, borderRadius: 99, padding: `${6 * s}px ${16 * s}px` }}>{d.score.label}</span>
        </div>
      )}

      {d.split && (
        <div style={{ ...keep, display: "flex", gap: 36 * s, marginTop: 28 * s }}>
          <Bar label="Home" value={d.split.home} color={C.bright} scale={s} />
          <Bar label="Diaspora" value={d.split.diaspora} color={C.orange} scale={s} />
        </div>
      )}

      {d.quote && <span style={{ ...keep, fontSize: (story ? 30 : 25) * s, lineHeight: 1.4, color: C.paper, marginTop: (busy ? 16 : 28) * s }}>{`“${clip(d.quote, story ? 260 : 120)}”`}</span>}

      {lines.length > 0 && (
        <div style={{ ...keep, display: "flex", flexDirection: "column", gap: (story ? 12 : 9) * s, marginTop: (busy ? 18 : 26) * s }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: "flex", position: "relative", alignItems: "center", justifyContent: "space-between", border: `2px solid ${C.line}`, borderRadius: 14 * s, padding: `${(story ? 10 : 7) * s}px ${18 * s}px`, fontSize: (story ? 26 : 23) * s, color: C.paper, overflow: "hidden" }}>
              {l.bar !== undefined && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${l.bar}%`, background: i === 0 ? "rgba(14,124,102,0.45)" : C.line }} />}
              <span style={{ display: "flex" }}>{clip(l.label, story ? 40 : 46)}</span>
              {l.value && <span style={{ display: "flex", fontFamily: "Sora" }}>{l.value}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders a share card as a PNG. */
export async function renderCard(d: CardData, size: CardSize = "wide") {
  const { width, height } = CARD_SIZES[size];
  const story = size === "story";
  const element = story ? (
    <div style={{ display: "flex", flexDirection: "column", width, height, background: C.midnight, padding: 90, fontFamily: "Inter", color: C.paper }}>
      <Logo height={56} />
      <div style={{ display: "flex", marginTop: 110 }}>
        <Art variant={d.art} size={420} />
      </div>
      <div style={{ display: "flex", marginTop: 80, flex: 1 }}>
        <Body d={d} story />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `2px solid ${C.line}`, paddingTop: 40 }}>
        <span style={{ fontSize: 38, color: C.paper }}>{d.cta}</span>
        <span style={{ fontSize: 32, color: C.bright }}>wanana.africa</span>
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", width, height, background: C.midnight, padding: "56px 64px", fontFamily: "Inter", color: C.paper }}>
      <div style={{ display: "flex", gap: 52, flex: 1 }}>
        <Art variant={d.art} size={300} />
        <Body d={d} story={false} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid ${C.line}`, paddingTop: 26 }}>
        <Logo height={38} />
        <div style={{ display: "flex", fontSize: 24, color: C.mist }}>
          <span>{d.cta}</span>
          <span style={{ color: C.bright, marginLeft: 10 }}>wanana.africa</span>
        </div>
      </div>
    </div>
  );
  return new ImageResponse(element, { width, height, fonts: await loadFonts(), headers: { "Cache-Control": "public, max-age=600, s-maxage=600" } });
}

export const FALLBACK_CARD: CardData = {
  eyebrow: "Wanana",
  title: "The Intelligence Layer for African Music",
  subtitle: "Reviews, sentiment, discussions, polls and AI insights.",
  cta: "Join the conversation on",
  art: 0,
};
