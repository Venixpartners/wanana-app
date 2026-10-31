import { toggleAction, type ToggleKind } from "../actions";
import { SubmitButton } from "./submit-button";

/** A one tap form: like, helpful or follow. Works without JavaScript. */
export function ToggleButton({
  what,
  id,
  on,
  back,
  label,
  onLabel,
  count,
  disabled = false,
}: {
  what: ToggleKind;
  id: string;
  on: boolean;
  back: string;
  label: string;
  onLabel?: string;
  count?: number;
  disabled?: boolean;
}) {
  const text = on ? (onLabel ?? label) : label;
  return (
    <form action={toggleAction} className="inline">
      <input type="hidden" name="what" value={what} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="on" value={on ? "1" : "0"} />
      <input type="hidden" name="back" value={back} />
      <SubmitButton
        disabled={disabled}
        aria-pressed={on}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
          on ? "border-emerald bg-emerald/15 text-paper" : "border-line text-mist hover:border-mist hover:text-paper"
        }`}
      >
        {text}
        {count !== undefined && <span className="tabular-nums">{count.toLocaleString("en-GB")}</span>}
      </SubmitButton>
    </form>
  );
}
