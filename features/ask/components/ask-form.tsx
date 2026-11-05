"use client";

import { useActionState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { SubmitButton } from "@/features/community/components/submit-button";
import { askAction, type AskState } from "../actions";
import { AnswerView } from "./answer-view";

const idle: AskState = { status: "idle" };
const askHref = (q: string) => `/ai?q=${encodeURIComponent(q)}`;

export function AskForm({ initial, autoAsk }: { initial: string; autoAsk: boolean }) {
  const [state, action, pending] = useActionState(askAction, idle);
  const formRef = useRef<HTMLFormElement>(null);
  const asked = useRef(false);

  // A shared link (/ai?q=...) asks straight away, once.
  useEffect(() => {
    if (autoAsk && initial && !asked.current) {
      asked.current = true;
      formRef.current?.requestSubmit();
    }
  }, [autoAsk, initial]);

  const value = state.status === "error" ? (state.question ?? initial) : state.status === "answered" ? "" : initial;
  return (
    <div className="grid gap-6">
      <form ref={formRef} action={action} className="rounded-2xl border border-line bg-ink p-4">
        <label htmlFor="question" className="sr-only">
          Your question
        </label>
        <textarea
          key={state.status === "answered" ? state.question : "ask"}
          id="question"
          name="question"
          required
          minLength={3}
          maxLength={300}
          rows={2}
          defaultValue={value}
          placeholder="Ask about any song, album, artist or chart on Wanana"
          className="w-full resize-none bg-transparent text-lg text-paper outline-none placeholder:text-mist/70"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-mist">{state.status === "answered" && state.left !== null ? `${state.left} questions left today` : "Answers come only from fan data on Wanana."}</p>
          <SubmitButton className="btn gap-1.5" pendingLabel="Thinking…">
            <Sparkles size={16} aria-hidden="true" />
            Ask
          </SubmitButton>
        </div>
      </form>

      {state.status === "error" && (
        <p role="alert" className="rounded-xl border border-orange/50 p-4 text-sm">
          {state.message}
        </p>
      )}
      {pending && <p className="animate-pulse text-sm text-mist">Reading the scores, reviews and charts…</p>}
      {state.status === "answered" && !pending && <AnswerView question={state.question} answer={state.answer} sources={state.sources} askHref={askHref} />}
    </div>
  );
}
