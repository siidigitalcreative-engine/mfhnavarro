"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, WorkItem, Testimonial, MediaItem } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function mediaTypeFromFile(file: File): MediaItem["type"] {
  return file.type.startsWith("video/") ? "video" : "image";
}

export default function AdminPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(setContent)
      .catch(() => setContent(null));
  }, []);

  if (!content) return <div className="admin-shell">Loading…</div>;

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((c) => (c ? { ...c, [key]: value } : c));
  }

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function uploadFiles(workId: string, files: FileList | null) {
    if (!files?.length) return;
    setUploadingId(workId);

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });

          return {
            id: newId(),
            url: blob.url,
            type: mediaTypeFromFile(file),
            name: file.name,
          } satisfies MediaItem;
        })
      );

      update(
        "work",
        content.work.map((w) =>
          w.id === workId
            ? { ...w, media: [...(w.media ?? []), ...uploaded] }
            : w
        )
      );
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setUploadingId(null);
    }
  }

  function removeMedia(workId: string, mediaId: string) {
    update(
      "work",
      content.work.map((w) =>
        w.id === workId
          ? { ...w, media: (w.media ?? []).filter((m) => m.id !== mediaId) }
          : w
      )
    );
  }

  function moveMedia(workId: string, mediaId: string, direction: -1 | 1) {
    update(
      "work",
      content.work.map((w) => {
        if (w.id !== workId) return w;
        const media = [...(w.media ?? [])];
        const index = media.findIndex((m) => m.id === mediaId);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= media.length) return w;
        [media[index], media[nextIndex]] = [media[nextIndex], media[index]];
        return { ...w, media };
      })
    );
  }

  function updateWork(id: string, patch: Partial<WorkItem>) {
    update(
      "work",
      content.work.map((w) => (w.id === id ? { ...w, ...patch } : w))
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div>
          <div className="admin-kicker">MF NAVARRO / CMS</div>
          <h1>Site content</h1>
        </div>
        <div className="admin-topbar-actions">
          <button className="btn" onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
          <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {status === "saved" && <p className="admin-note">Changes saved.</p>}
      {status === "error" && <p className="admin-error">Something went wrong. Check the upload and try again.</p>}

      <section className="admin-section">
        <div className="admin-section-head"><h2>Hero</h2><span>01</span></div>
        <label>Headline</label>
        <textarea value={content.heroHeadline} onChange={(e) => update("heroHeadline", e.target.value)} />
        <label>Lede</label>
        <textarea value={content.heroLede} onChange={(e) => update("heroLede", e.target.value)} />
        <label>Now note</label>
        <textarea value={content.nowNote} onChange={(e) => update("nowNote", e.target.value)} />
        <label>Tools (comma separated)</label>
        <input
          value={content.tools.join(", ")}
          onChange={(e) => update("tools", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
        />
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div><div className="admin-kicker">PORTFOLIO</div><h2>Work</h2></div>
          <button className="btn btn-ghost" onClick={() => update("work", [...content.work, { id: newId(), name: "", desc: "", tag: "", media: [] }])}>
            + Add work
          </button>
        </div>

        <p className="admin-help">Each project can contain multiple photos and videos. The first item becomes the primary visual.</p>

        {content.work.map((item, index) => (
          <div className="admin-card" key={item.id}>
            <div className="admin-card-top"><span className="admin-index">{String(index + 1).padStart(2, "0")}</span><span>{item.media?.length ?? 0} media</span></div>
            <input placeholder="Project name" value={item.name} onChange={(e) => updateWork(item.id, { name: e.target.value })} />
            <textarea placeholder="Description" value={item.desc} onChange={(e) => updateWork(item.id, { desc: e.target.value })} />
            <input placeholder="Tag, e.g. Brand · Motion" value={item.tag} onChange={(e) => updateWork(item.id, { tag: e.target.value })} />

            <div className="upload-zone">
              <input
                id={`upload-${item.id}`}
                className="file-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  void uploadFiles(item.id, e.target.files);
                  e.currentTarget.value = "";
                }}
              />
              <label className="upload-label" htmlFor={`upload-${item.id}`}>
                <strong>{uploadingId === item.id ? "Uploading…" : "Add photos / videos"}</strong>
                <span>Select multiple files at once</span>
              </label>
            </div>

            {!!item.media?.length && (
              <div className="admin-media-grid">
                {item.media.map((media, mediaIndex) => (
                  <div className="admin-media-card" key={media.id}>
                    <div className="admin-media-preview">
                      {media.type === "video" ? <video src={media.url} controls /> : <img src={media.url} alt={media.name ?? item.name} />}
                    </div>
                    <div className="admin-media-meta">
                      <span>{String(mediaIndex + 1).padStart(2, "0")} / {media.type}</span>
                      <div className="admin-media-actions">
                        <button className="icon-btn" disabled={mediaIndex === 0} onClick={() => moveMedia(item.id, media.id, -1)} aria-label="Move media left">←</button>
                        <button className="icon-btn" disabled={mediaIndex === item.media!.length - 1} onClick={() => moveMedia(item.id, media.id, 1)} aria-label="Move media right">→</button>
                        <button className="icon-btn danger" onClick={() => removeMedia(item.id, media.id)} aria-label="Remove media">×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-ghost danger-button" onClick={() => update("work", content.work.filter((w) => w.id !== item.id))}>Remove project</button>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Testimonials</h2>
          <button className="btn btn-ghost" onClick={() => update("testimonials", [...content.testimonials, { id: newId(), quote: "", who: "" } as Testimonial])}>+ Add testimonial</button>
        </div>
        {content.testimonials.map((t) => (
          <div className="admin-card" key={t.id}>
            <textarea placeholder="Quote" value={t.quote} onChange={(e) => update("testimonials", content.testimonials.map((x) => x.id === t.id ? { ...x, quote: e.target.value } : x))} />
            <input placeholder="Name — role, company" value={t.who} onChange={(e) => update("testimonials", content.testimonials.map((x) => x.id === t.id ? { ...x, who: e.target.value } : x))} />
            <button className="btn btn-ghost danger-button" onClick={() => update("testimonials", content.testimonials.filter((x) => x.id !== t.id))}>Remove</button>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <h2>Clients</h2>
        <input value={content.clients.join(", ")} onChange={(e) => update("clients", e.target.value.split(",").map((c) => c.trim()).filter(Boolean))} />
      </section>

      <section className="admin-section">
        <h2>About</h2>
        {content.aboutParagraphs.map((p, i) => (
          <textarea key={i} value={p} onChange={(e) => { const next = [...content.aboutParagraphs]; next[i] = e.target.value; update("aboutParagraphs", next); }} />
        ))}
        <button className="btn btn-ghost" onClick={() => update("aboutParagraphs", [...content.aboutParagraphs, ""])}>+ Add paragraph</button>
      </section>

      <section className="admin-section">
        <h2>Contact email</h2>
        <input value={content.email} onChange={(e) => update("email", e.target.value)} />
      </section>
    </div>
  );
}
