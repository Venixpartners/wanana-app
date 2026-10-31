"use client";

import { useActionState } from "react";
import { saveArtistAction, type EditorState } from "../admin-actions";
import { Field, FormFooter, LinkFields, PublishToggle } from "./fields";

type Initial = {
  id?: string;
  name?: string;
  slug?: string;
  country_code?: string | null;
  genres?: string[];
  summary?: string | null;
  links?: Record<string, string>;
  is_published?: boolean;
};

export function ArtistEditor({ initial = {}, countrySelect }: { initial?: Initial; countrySelect: React.ReactNode }) {
  const [state, action, pending] = useActionState<EditorState, FormData>(saveArtistAction, { status: "idle" });
  const f = state.fields ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <Field name="name" label="Artist name" error={f.name}>
        <input id="name" name="name" defaultValue={initial.name} maxLength={120} className="field" />
      </Field>
      <Field name="slug" label="Page address" error={f.slug} hint="Leave blank to build it from the name, for example burna-boy.">
        <input id="slug" name="slug" defaultValue={initial.slug} maxLength={80} className="field" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="country_code" label="Country" error={f.country_code}>
          {countrySelect}
        </Field>
        <Field name="genres" label="Genres" error={f.genres} hint="Separate with commas, up to 6.">
          <input id="genres" name="genres" defaultValue={initial.genres?.join(", ")} className="field" placeholder="Afrobeats, Afro fusion" />
        </Field>
      </div>
      <Field name="summary" label="Short summary" error={f.summary} hint="Up to 600 characters, in Wanana's own words.">
        <textarea id="summary" name="summary" rows={4} maxLength={600} defaultValue={initial.summary ?? ""} className="field" />
      </Field>
      <LinkFields links={initial.links} errors={f} />
      <PublishToggle checked={initial.is_published ?? true} />
      <FormFooter pending={pending} message={state.message} label={initial.id ? "Save artist" : "Add artist"} />
    </form>
  );
}
