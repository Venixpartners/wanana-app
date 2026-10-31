"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "../schema";
import { setAvatarAction } from "../actions";
import { Avatar } from "./avatar";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function AvatarUpload({ userId, name, url }: { userId: string; name: string; url?: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onFile(file: File) {
    setMessage(null);
    if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) return setMessage("Use a JPG, PNG or WebP image.");
    if (file.size > AVATAR_MAX_BYTES) return setMessage("Choose an image under 2 MB.");

    setBusy(true);
    const supabase = createBrowserSupabase();
    const path = `${userId}/avatar-${Date.now()}.${EXT[file.type]}`;
    const { error } = await supabase.storage.from("profile-photos").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) {
      setBusy(false);
      return setMessage("Upload failed. Please try again.");
    }
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
    const saved = await setAvatarAction(data.publicUrl);
    if (!saved.ok) {
      await supabase.storage.from("profile-photos").remove([path]);
      setBusy(false);
      return setMessage(saved.message ?? "That photo couldn't be saved.");
    }
    // Tidy up the previous photo so old images don't pile up.
    const old = url?.split("/profile-photos/")[1];
    if (old) await supabase.storage.from("profile-photos").remove([old]);
    setBusy(false);
    router.refresh();
  }

  async function onRemove() {
    setBusy(true);
    const old = url?.split("/profile-photos/")[1];
    const saved = await setAvatarAction(null);
    if (saved.ok && old) await createBrowserSupabase().storage.from("profile-photos").remove([old]);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar name={name} url={url} size={80} />
      <div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-quiet">
            {busy ? "Uploading…" : url ? "Change photo" : "Add a photo"}
          </button>
          {url && (
            <button type="button" onClick={onRemove} disabled={busy} className="btn-quiet">
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-mist">JPG, PNG or WebP, up to 2 MB.</p>
        {message && (
          <p role="alert" className="mt-1 text-sm text-orange">
            {message}
          </p>
        )}
        <input
          ref={input}
          type="file"
          accept={AVATAR_TYPES.join(",")}
          className="sr-only"
          aria-label="Profile photo"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
