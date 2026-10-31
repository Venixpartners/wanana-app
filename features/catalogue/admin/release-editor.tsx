"use client";

import { useActionState } from "react";
import { saveReleaseAction, type EditorState } from "../admin-actions";
import { Field, FormFooter, LinkFields, PublishToggle } from "./fields";

type Option = { id: string; name: string };
type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  artist_id?: string;
  kind?: string;
  release_date?: string | null;
  label?: string | null;
  upc?: string | null;
  links?: Record<string, string>;
  is_published?: boolean;
};

export function ReleaseEditor({ initial = {}, artists }: { initial?: Initial; artists: Option[] }) {
  const [state, action, pending] = useActionState<EditorState, FormData>(saveReleaseAction, { status: "idle" });
  const f = state.fields ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <Field name="title" label="Title" error={f.title}>
        <input id="title" name="title" defaultValue={initial.title} maxLength={160} className="field" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="artist_id" label="Artist" error={f.artist_id}>
          <select id="artist_id" name="artist_id" defaultValue={initial.artist_id ?? ""} className="field appearance-none">
            <option value="" disabled>
              Choose the artist
            </option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <Field name="kind" label="Type" error={f.kind}>
          <select id="kind" name="kind" defaultValue={initial.kind ?? "album"} className="field appearance-none">
            <option value="album">Album</option>
            <option value="ep">EP</option>
            <option value="single">Single</option>
            <option value="mixtape">Mixtape</option>
          </select>
        </Field>
        <Field name="release_date" label="Release date" error={f.release_date}>
          <input id="release_date" name="release_date" type="date" defaultValue={initial.release_date ?? ""} className="field" />
        </Field>
        <Field name="label" label="Label" error={f.label}>
          <input id="label" name="label" defaultValue={initial.label ?? ""} maxLength={120} className="field" />
        </Field>
        <Field name="upc" label="UPC" error={f.upc} hint="Optional barcode, 12 to 14 digits.">
          <input id="upc" name="upc" inputMode="numeric" defaultValue={initial.upc ?? ""} className="field" />
        </Field>
        <Field name="slug" label="Page address" error={f.slug} hint="Leave blank to build it automatically.">
          <input id="slug" name="slug" defaultValue={initial.slug} maxLength={100} className="field" />
        </Field>
      </div>
      <LinkFields links={initial.links} errors={f} />
      <PublishToggle checked={initial.is_published ?? true} />
      <FormFooter pending={pending} message={state.message} label={initial.id ? "Save release" : "Add release"} />
    </form>
  );
}
