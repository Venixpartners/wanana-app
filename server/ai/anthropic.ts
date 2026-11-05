// Server only: reads ANTHROPIC_API_KEY, which is never sent to the browser.
// The single AI gateway. Every model call in Wanana goes through here.

export const AI_MODEL = process.env.AI_MODEL || "claude-sonnet-5-5";

export class AiUnavailable extends Error {}

type Tool = { name: string; description: string; input_schema: Record<string, unknown> };

export type ToolCallResult<T> = { input: T; model: string; inputTokens: number; outputTokens: number };

/** Calls Claude and forces one tool call, so the reply always comes back as structured data. */
export async function callTool<T>(opts: { system: string; user: string; tool: Tool; maxTokens?: number }): Promise<ToolCallResult<T>> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AiUnavailable("ANTHROPIC_API_KEY is not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: opts.maxTokens ?? 1500,
      system: opts.system,
      tools: [opts.tool],
      tool_choice: { type: "tool", name: opts.tool.name },
      messages: [{ role: "user", content: opts.user }],
    }),
    signal: AbortSignal.timeout(50_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("anthropic error", res.status, body.slice(0, 300));
    if (res.status === 401 || res.status === 403) throw new AiUnavailable("AI key rejected");
    throw new Error(`AI request failed (${res.status})`);
  }
  const data = (await res.json()) as {
    model: string;
    content: { type: string; name?: string; input?: unknown }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const block = data.content.find((c) => c.type === "tool_use" && c.name === opts.tool.name);
  if (!block) throw new Error("AI reply had no answer");
  return { input: block.input as T, model: data.model, inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0 };
}
