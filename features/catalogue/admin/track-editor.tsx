"use client";

import { useActionState } from "react";
import { saveTrackAction, type EditorState } from "../admin-actions";
import { formatDuration } from "../format";
import { Field, FormFooter, LinkFields, PublishToggle } from "./fields";

type Option = { id: string; name: string };
type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  artist_id?: string;
  release_id?: string | null;
  track_number?: number | null;
  isrc?: string | null;
  duration_seconds?: number | null;
  release_date?: string | null;
  links?: Record<string, string>;
  is_published?: boolean;
  featured_ids?: string[];
};

export function TrackEditor({ initial = {}, artists, releases }: { initial?: Initial; artists: Option[]; releases: Option[] }) {
  const [state, action, pending] = useActionState<EditorState, FormData>(saveTrackAction, { status: "idle" });
  const f = state.fields ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <Field name="title" label="Song title" error={f.title}>
        <input id="title" name="title" defaultValue={initial.title} maxLength={160} className="field" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="artist_id" label="Main artist" error={f.artist_id}>
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
        <Field name="release_id" label="On release" error={f.release_id} hint="Optional. Leave blank for a standalone song.">
          <select id="release_id" name="release_id" defaultValue={initial.release_id ?? ""} className="field appearance-none">
            <option value="">No release</option>
            {releases.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field name="featured_ids" label="Featured artists" error={f.featured_ids} hint="Hold Ctrl or Cmd to pick more than one.">
        <select id="featured_ids" name="featured_ids" multiple defaultValue={initial.featured_ids ?? []} className="field h-36">
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field name="track_number" label="Track number" error={f.track_number}>
          <input id="track_number" name="track_number" inputMode="numeric" defaultValue={initial.track_number ?? ""} className="field" />
        </Field>
        <Field name="duration" label="Length" error={f.duration} hint="Minutes and seconds, like 3:45.">
          <input id="duration" name="duration" defaultValue={formatDuration(initial.duration_seconds)} className="field" />
        </Field>
        <Field name="release_date" label="Release date" error={f.release_date}>
          <input id="release_date" name="release_date" type="date" defaultValue={initial.release_date ?? ""} className="field" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="isrc" label="ISRC" error={f.isrc} hint="The song's international code. Lets us match it across every platform later.">
          <input id="isrc" name="isrc" defaultValue={initial.isrc ?? ""} className="field uppercase" />
        </Field>
        <Field name="slug" label="Page address" error={f.slug} hint="Leave blank to build it automatically.">
          <input id="slug" name="slug" defaultValue={initial.slug} maxLength={120} className="field" />
        </Field>
      </div>
      <LinkFields links={initial.links} errors={f} />
      <PublishToggle checked={initial.is_published ?? true} />
      <FormFooter pending={pending} message={state.message} label={initial.id ? "Save song" : "Add song"} />
    </form>
  );
}
