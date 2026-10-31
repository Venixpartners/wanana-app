import { PLATFORMS } from "../platforms";

export function Field({
  name,
  label,
  error,
  hint,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-mist">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-orange">
          {error}
        </p>
      )}
    </div>
  );
}

export function LinkFields({ links = {}, errors = {} }: { links?: Record<string, string>; errors?: Record<string, string> }) {
  return (
    <fieldset className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2 sm:p-5">
      <legend className="px-2 text-sm text-mist">Streaming links (optional)</legend>
      {PLATFORMS.map((p) => (
        <Field key={p.key} name={`link_${p.key}`} label={p.label} error={errors[`link_${p.key}`]}>
          <input id={`link_${p.key}`} name={`link_${p.key}`} type="url" inputMode="url" defaultValue={links[p.key] ?? ""} className="field" placeholder="https://" />
        </Field>
      ))}
    </fieldset>
  );
}

export function PublishToggle({ checked = true }: { checked?: boolean }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" name="is_published" defaultChecked={checked} className="size-4 accent-[#0E7C66]" />
      Published, visible to everyone
    </label>
  );
}

export function FormFooter({ pending, message, label }: { pending: boolean; message?: string; label: string }) {
  return (
    <div className="grid gap-3">
      {message && (
        <p role="alert" className="text-sm text-orange">
          {message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn sm:justify-self-start">
        {pending ? "Saving…" : label}
      </button>
    </div>
  );
}
