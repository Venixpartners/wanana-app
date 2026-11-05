"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Image as ImageIcon, MessageCircle, Share2 } from "lucide-react";
import { channelUrl, newShareCode, storyCardPath, trackedUrl, type ShareChannel } from "@/features/share/links";
import { recordShareAction } from "@/features/share/actions";

const item = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-paper transition hover:bg-line/70";

/** Share menu: WhatsApp, X, Facebook, a story image for Instagram and TikTok, copy link, and the phone's own share sheet. */
export function ShareButton({ path, title }: { path: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const story = storyCardPath(path);

  useEffect(() => setCanNative(typeof navigator !== "undefined" && !!navigator.share), []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  /** Makes a tracked link for this share and records it in the background. */
  function link(channel: ShareChannel) {
    const code = newShareCode();
    recordShareAction(code, path, channel).catch(() => {});
    return trackedUrl(window.location.origin, path, code);
  }

  function go(channel: "whatsapp" | "x" | "facebook") {
    const href = channelUrl(channel, link(channel), title);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link("copy"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing else to do.
    }
    setOpen(false);
  }

  async function native() {
    setOpen(false);
    try {
      await navigator.share({ title, url: link("native") });
    } catch {
      // The person closed the share sheet.
    }
  }

  function image() {
    if (!story) return;
    link("image");
    window.open(`${story}?size=story`, "_blank", "noopener");
    setOpen(false);
  }

  return (
    <div ref={box} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-mist transition hover:border-mist hover:text-paper"
      >
        {copied ? <Check size={15} aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
        {copied ? "Link copied" : "Share"}
      </button>
      {open && (
        <div role="menu" className="absolute left-0 z-30 mt-2 w-60 rounded-xl border border-line bg-ink p-1.5 shadow-xl shadow-black/40">
          <button role="menuitem" type="button" className={item} onClick={() => go("whatsapp")}>
            <MessageCircle size={16} className="text-emerald-bright" aria-hidden="true" />
            WhatsApp
          </button>
          <button role="menuitem" type="button" className={item} onClick={() => go("x")}>
            <span aria-hidden="true" className="w-4 text-center font-semibold">X</span>
            X
          </button>
          <button role="menuitem" type="button" className={item} onClick={() => go("facebook")}>
            <span aria-hidden="true" className="w-4 text-center font-semibold">f</span>
            Facebook
          </button>
          {story && (
            <button role="menuitem" type="button" className={item} onClick={image}>
              <ImageIcon size={16} className="text-gold" aria-hidden="true" />
              Story image for Instagram or TikTok
            </button>
          )}
          <button role="menuitem" type="button" className={item} onClick={copy}>
            <Copy size={16} aria-hidden="true" />
            Copy link
          </button>
          {canNative && (
            <button role="menuitem" type="button" className={item} onClick={native}>
              <Share2 size={16} aria-hidden="true" />
              More options
            </button>
          )}
        </div>
      )}
    </div>
  );
}
