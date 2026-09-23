"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, WorkItem, Testimonial } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AdminPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(setContent);
  }, []);

  if (!content) return <div className="admin-shell">Loading…</div>;

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((c) => (c ? { ...c, [key]: value } : c));
  }

  async function handleSave() {
    setStatus("saving");
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function uploadFile(id: string, file: File) {
    setUploadingId(id);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    setUploadingId(null);
    if (!res.ok) return;
    const { url, mediaType } = await res.json();
    const work = content!.work.map((w) =>
      w.id === id ? { ...w, mediaUrl: url, mediaType } : w
    );
    update("work", work);
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Site content</h1>
        <div className="admin-topbar-actions">
          <button className="btn" onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
      {status === "saved" && <p className="admin-note">Saved.</p>}
      {status === "error" && <p className="admin-error">Couldn&apos;t save — try again.</p>}

      <section className="admin-section">
        <h2>Hero</h2>
        <label>Headline</label>
        <textarea
          value={content.heroHeadline}
          onChange={(e) => update("heroHeadline", e.target.value)}
        />
        <label>Lede</label>
        <textarea
          value={content.heroLede}
          onChange={(e) => update("heroLede", e.target.value)}
        />
        <label>&quot;Now&quot; note</label>
        <textarea
          value={content.nowNote}
          onChange={(e) => update("nowNote", e.target.value)}
        />
        <label>Tools (comma separated)</label>
        <input
          value={content.tools.join(", ")}
          onChange={(e) =>
            update(
              "tools",
              e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
            )
          }
        />
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Work</h2>
          <button
            className="btn btn-ghost"
            onClick={() =>
              update("work", [
                ...content.work,
                { id: newId(), name: "", desc: "", tag: "" },
              ])
            }
          >
            + Add work
          </button>
        </div>
        {content.work.map((item) => (
          <div className="admin-card" key={item.id}>
            <input
              placeholder="Project name"
              value={item.name}
              onChange={(e) =>
                update(
                  "work",
                  content.work.map((w) =>
                    w.id === item.id ? { ...w, name: e.target.value } : w
                  )
                )
              }
            />
            <textarea
              placeholder="Description"
              value={item.desc}
              onChange={(e) =>
                update(
                  "work",
                  content.work.map((w) =>
                    w.id === item.id ? { ...w, desc: e.target.value } : w
                  )
                )
              }
            />
            <input
              placeholder="Tag, e.g. Brand · Motion"
              value={item.tag}
              onChange={(e) =>
                update(
                  "work",
                  content.work.map((w) =>
                    w.id === item.id ? { ...w, tag: e.target.value } : w
                  )
                )
              }
            />
            <div className="admin-media-row">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(item.id, file);
                }}
              />
              {uploadingId === item.id && <span>Uploading…</span>}
              {item.mediaUrl &&
                (item.mediaType === "video" ? (
                  <video src={item.mediaUrl} controls className="admin-thumb" />
                ) : (
                  <img src={item.mediaUrl} alt="" className="admin-thumb" />
                ))}
            </div>
            <button
              className="btn btn-ghost"
              onClick={() =>
                update(
                  "work",
                  content.work.filter((w) => w.id !== item.id)
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Testimonials</h2>
          <button
            className="btn btn-ghost"
            onClick={() =>
              update("testimonials", [
                ...content.testimonials,
                { id: newId(), quote: "", who: "" } as Testimonial,
              ])
            }
          >
            + Add testimonial
          </button>
        </div>
        {content.testimonials.map((t) => (
          <div className="admin-card" key={t.id}>
            <textarea
              placeholder="Quote"
              value={t.quote}
              onChange={(e) =>
                update(
                  "testimonials",
                  content.testimonials.map((x) =>
                    x.id === t.id ? { ...x, quote: e.target.value } : x
                  )
                )
              }
            />
            <input
              placeholder="Name — role, company"
              value={t.who}
              onChange={(e) =>
                update(
                  "testimonials",
                  content.testimonials.map((x) =>
                    x.id === t.id ? { ...x, who: e.target.value } : x
                  )
                )
              }
            />
            <button
              className="btn btn-ghost"
              onClick={() =>
                update(
                  "testimonials",
                  content.testimonials.filter((x) => x.id !== t.id)
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <h2>Clients (comma separated)</h2>
        <input
          value={content.clients.join(", ")}
          onChange={(e) =>
            update(
              "clients",
              e.target.value.split(",").map((c) => c.trim()).filter(Boolean)
            )
          }
        />
      </section>

      <section className="admin-section">
        <h2>About</h2>
        {content.aboutParagraphs.map((p, i) => (
          <textarea
            key={i}
            value={p}
            onChange={(e) => {
              const next = [...content.aboutParagraphs];
              next[i] = e.target.value;
              update("aboutParagraphs", next);
            }}
          />
        ))}
        <button
          className="btn btn-ghost"
          onClick={() =>
            update("aboutParagraphs", [...content.aboutParagraphs, ""])
          }
        >
          + Add paragraph
        </button>
      </section>

      <section className="admin-section">
        <h2>Contact email</h2>
        <input value={content.email} onChange={(e) => update("email", e.target.value)} />
      </section>
    </div>
  );
}
