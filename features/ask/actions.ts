"use server";

import { getViewer } from "@/lib/supabase/server";
import { AiUnavailable, callTool } from "@/server/ai/anthropic";
import { ANSWER_TOOL, SYSTEM_PROMPT, cleanAnswer, questionSchema, type Answer, type Source } from "./answer";
import { buildContext } from "./context";

export type AskState =
  | { status: "idle" }
  | { status: "error"; message: string; question?: string }
  | { status: "answered"; question: string; answer: Answer; sources: Source[]; left: number | null };

export async function askAction(_prev: AskState, form: FormData): Promise<AskState> {
  const { supabase, userId, profile } = await getViewer();
  if (!userId || !profile) return { status: "error", message: "Sign in to ask Wanana." };
  const parsed = questionSchema.safeParse(String(form.get("question") ?? ""));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Ask a question first." };
  const question = parsed.data;

  const { data: left } = await supabase.rpc("ai_questions_left");
  if (typeof left === "number" && left <= 0) return { status: "error", message: "That's your 20 questions for today. Ask again tomorrow.", question };

  const { sources, brief } = await buildContext(question);
  let answer: Answer | null = null;
  let usage = { model: "", inputTokens: 0, outputTokens: 0 };
  try {
    const res = await callTool<unknown>({
      system: SYSTEM_PROMPT,
      user: `Wanana data, as of ${new Date().toISOString().slice(0, 10)}:\n\n${brief}\n\nThe fan's question: ${question}`,
      tool: ANSWER_TOOL as unknown as Parameters<typeof callTool>[0]["tool"],
    });
    answer = cleanAnswer(res.input, sources);
    usage = { model: res.model, inputTokens: res.inputTokens, outputTokens: res.outputTokens };
  } catch (e) {
    if (e instanceof AiUnavailable) return { status: "error", message: "Ask Wanana isn't switched on yet. Check back soon.", question };
    console.error("ask failed", (e as Error).message);
    return { status: "error", message: "Ask Wanana couldn't answer just now. Please try again.", question };
  }
  if (!answer) return { status: "error", message: "Ask Wanana couldn't answer that one. Try asking it another way.", question };

  const { error } = await supabase.from("ai_questions").insert({
    user_id: userId,
    question,
    answer,
    sources,
    model: usage.model,
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
  });
  if (error?.message?.includes("rate_limited")) return { status: "error", message: "That's your 20 questions for today. Ask again tomorrow.", question };
  if (error) console.error("save question failed", error.code, error.message);

  return { status: "answered", question, answer, sources, left: typeof left === "number" ? left - 1 : null };
}
