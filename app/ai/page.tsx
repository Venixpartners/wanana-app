import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageShell, PageTitle } from "@/components/page-shell";
import { getViewer } from "@/lib/supabase/server";
import { isUuid, timeAgo } from "@/lib/text";
import { Section } from "@/features/catalogue/components/section";
import { AskForm } from "@/features/ask/components/ask-form";
import { AnswerView } from "@/features/ask/components/answer-view";
import { STARTERS, answerSchema, questionSchema, type Source } from "@/features/ask/answer";

// Answers can take a little while.
export const maxDuration = 60;

type Props = { searchParams: Promise<{ q?: string; h?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = questionSchema.safeParse((await searchParams).q ?? "");
  const title = q.success ? `Ask Wanana: ${q.data}` : "Ask Wanana";
  const description = "Ask anything about African music on Wanana. Answers come from what fans at home and in the diaspora actually score and say.";
  return { title, description, openGraph: { title, description, url: "/ai" } };
}

const askHref = (q: string) => `/ai?q=${encodeURIComponent(q)}`;

export default async function AskPage({ searchParams }: Props) {
  const { q, h } = await searchParams;
  const { supabase, userId, profile } = await getViewer();
  const member = !!(userId && profile);
  const initial = questionSchema.safeParse(q ?? "");

  const [{ data: history }, { data: past }] = member
    ? await Promise.all([
        supabase.from("ai_questions").select("id, question, created_at").order("created_at", { ascending: false }).limit(10),
        h && isUuid(h) ? supabase.from("ai_questions").select("id, question, answer, sources, created_at").eq("id", h).maybeSingle() : Promise.resolve({ data: null }),
      ])
    : [{ data: [] }, { data: null }];
  const pastAnswer = past ? answerSchema.safeParse(past.answer) : null;

  return (
    <PageShell width="max-w-3xl">
      <PageTitle title="Ask Wanana" intro="Ask about any song, album, artist or chart. Answers come only from what fans on Wanana score and say, with the sources to check." />

      <div className="mt-8">
        {member ? (
          <AskForm initial={initial.success ? initial.data : ""} autoAsk={initial.success && !h} />
        ) : (
          <div className="rounded-2xl border border-line bg-ink p-5">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <Sparkles size={18} className="text-gold" aria-hidden="true" />
              {initial.success ? `"${initial.data}"` : "Sign in to ask"}
            </p>
            <p className="mt-2 text-sm text-mist">Ask Wanana is free for fans with an account, up to 20 questions a day.</p>
            <Link href="/signin" className="btn mt-4">
              Sign in to ask
            </Link>
          </div>
        )}
      </div>

      {past && pastAnswer?.success && (
        <div className="mt-6">
          <p className="mb-2 text-xs text-mist">Asked {timeAgo(past.created_at as string)}. Fan data may have moved since.</p>
          <AnswerView question={past.question as string} answer={pastAnswer.data} sources={(past.sources ?? []) as Source[]} askHref={askHref} />
        </div>
      )}

      <Section title="Try asking">
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <Link key={s} href={askHref(s)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-mist">
              {s}
            </Link>
          ))}
        </div>
      </Section>

      {member && (history?.length ?? 0) > 0 && (
        <Section title="Your recent questions">
          <ul className="divide-y divide-line rounded-2xl border border-line bg-ink">
            {(history ?? []).map((r) => (
              <li key={r.id as string}>
                <Link href={`/ai?h=${r.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-midnight/40">
                  <span className="min-w-0 truncate">{r.question as string}</span>
                  <span className="shrink-0 text-xs text-mist">{timeAgo(r.created_at as string)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-mist">Only you can see your questions.</p>
        </Section>
      )}
    </PageShell>
  );
}
