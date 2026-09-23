"use client";

import { upload } from "@vercel/blob/client";
import { DragEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, WorkItem, Testimonial, MediaItem, ClientItem, WorkLayer } from "@/lib/types";

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
  const [uploadProgress, setUploadProgress] = useState<Record<string, { name: string; progress: number; status: "uploading" | "done" | "error" }[]>>({});
  const [uploadingClientId, setUploadingClientId] = useState<string | null>(null);
  const [uploadingLayerId, setUploadingLayerId] = useState<string | null>(null);
  const [layerProgress, setLayerProgress] = useState<Record<string, number>>({});
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

  async function uploadFiles(workId: string, files: FileList | File[]) {
    const selected = Array.from(files);
    if (!selected.length) return;

    const validFiles = selected.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    });

    if (!validFiles.length) {
      setStatus("error");
      return;
    }

    setUploadingId(workId);
    setUploadProgress((current) => ({
      ...current,
      [workId]: validFiles.map((file) => ({ name: file.name, progress: 0, status: "uploading" as const })),
    }));

    try {
      for (let index = 0; index < validFiles.length; index++) {
        const file = validFiles[index];

        try {
          const blob = await upload(`${Date.now()}-${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
            multipart: true,
            onUploadProgress(event) {
              setUploadProgress((current) => ({
                ...current,
                [workId]: (current[workId] ?? []).map((item, itemIndex) =>
                  itemIndex === index ? { ...item, progress: Math.round(event.percentage) } : item
                ),
              }));
            },
          });

          const media: MediaItem = {
            id: newId(),
            url: blob.url,
            type: mediaTypeFromFile(file),
            name: file.name,
          };

          setContent((current) => {
            if (!current) return current;
            return {
              ...current,
              work: current.work.map((w) =>
                w.id === workId ? { ...w, media: [...(w.media ?? []), media] } : w
              ),
            };
          });

          setUploadProgress((current) => ({
            ...current,
            [workId]: (current[workId] ?? []).map((item, itemIndex) =>
              itemIndex === index ? { ...item, progress: 100, status: "done" as const } : item
            ),
          }));
        } catch (error) {
          console.error(`Upload failed for ${file.name}`, error);
          setUploadProgress((current) => ({
            ...current,
            [workId]: (current[workId] ?? []).map((item, itemIndex) =>
              itemIndex === index ? { ...item, status: "error" as const } : item
            ),
          }));
          setStatus("error");
        }
      }
    } finally {
      setUploadingId(null);
    }
  }

  async function uploadClientLogo(clientId: string, file: File | undefined) {
    if (!file) return;
    setUploadingClientId(clientId);
    try {
      const blob = await upload(`client-${clientId}-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setContent((current) => current ? {
        ...current,
        clients: current.clients.map((client) => client.id === clientId ? { ...client, logoUrl: blob.url } : client),
      } : current);
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setUploadingClientId(null);
    }
  }

  function removeMedia(workId: string, mediaId: string) {
    if (!content) return;
    update("work", content.work.map((w) => w.id === workId ? { ...w, media: (w.media ?? []).filter((m) => m.id !== mediaId) } : w));
  }

  function moveMedia(workId: string, mediaId: string, direction: -1 | 1) {
    if (!content) return;
    update("work", content.work.map((w) => {
      if (w.id !== workId) return w;
      const media = [...(w.media ?? [])];
      const index = media.findIndex((m) => m.id === mediaId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= media.length) return w;
      [media[index], media[nextIndex]] = [media[nextIndex], media[index]];
      return { ...w, media };
    }));
  }

  function updateWork(id: string, patch: Partial<WorkItem>) {
    if (!content) return;
    update("work", content.work.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  function updateLayer(workId: string, layerId: string, patch: Partial<WorkLayer>) {
    if (!content) return;
    update("work", content.work.map((w) => w.id === workId
      ? { ...w, layers: (w.layers ?? []).map((layer) => layer.id === layerId ? { ...layer, ...patch } : layer) }
      : w
    ));
  }

  function addLayer(workId: string, type: WorkLayer["type"]) {
    if (!content) return;
    const layer: WorkLayer = { id: newId(), type, ...(type === "text" ? { text: "Section title" } : {}) };
    update("work", content.work.map((w) => w.id === workId ? { ...w, layers: [...(w.layers ?? []), layer] } : w));
  }

  function removeLayer(workId: string, layerId: string) {
    if (!content) return;
    update("work", content.work.map((w) => w.id === workId ? { ...w, layers: (w.layers ?? []).filter((layer) => layer.id !== layerId) } : w));
  }

  function moveLayer(workId: string, layerId: string, direction: -1 | 1) {
    if (!content) return;
    update("work", content.work.map((w) => {
      if (w.id !== workId) return w;
      const layers = [...(w.layers ?? [])];
      const index = layers.findIndex((layer) => layer.id === layerId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= layers.length) return w;
      [layers[index], layers[nextIndex]] = [layers[nextIndex], layers[index]];
      return { ...w, layers };
    }));
  }

  async function uploadLayerFile(workId: string, layerId: string, file: File | undefined) {
    if (!file) return;
    setUploadingLayerId(layerId);
    setLayerProgress((current) => ({ ...current, [layerId]: 0 }));
    try {
      const blob = await upload(`landing-${workId}-${layerId}-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: true,
        onUploadProgress(event) {
          setLayerProgress((current) => ({ ...current, [layerId]: Math.round(event.percentage) }));
        },
      });
      updateLayer(workId, layerId, { url: blob.url, name: file.name });
      setLayerProgress((current) => ({ ...current, [layerId]: 100 }));
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setUploadingLayerId(null);
    }
  }

  function updateClient(id: string, patch: Partial<ClientItem>) {
    if (!content) return;
    update("clients", content.clients.map((client) => client.id === id ? { ...client, ...patch } : client));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, workId: string) {
    event.preventDefault();
    if (uploadingId !== workId) void uploadFiles(workId, event.dataTransfer.files);
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div><div className="admin-kicker">MF NAVARRO / CMS</div><h1>Site content</h1></div>
        <div className="admin-topbar-actions">
          <button className="btn" onClick={handleSave} disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save changes"}</button>
          <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {status === "saved" && <p className="admin-note">Changes saved.</p>}
      {status === "error" && <p className="admin-error">Something went wrong. Check the upload and try again.</p>}

      <section className="admin-section">
        <div className="admin-section-head"><h2>Hero</h2><span>01</span></div>
        <label>Headline</label><textarea value={content.heroHeadline} onChange={(e) => update("heroHeadline", e.target.value)} />
        <label>Lede</label><textarea value={content.heroLede} onChange={(e) => update("heroLede", e.target.value)} />
        <label>Now note</label><textarea value={content.nowNote} onChange={(e) => update("nowNote", e.target.value)} />
        <label>Tools (comma separated)</label>
        <input value={content.tools.join(", ")} onChange={(e) => update("tools", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div><div className="admin-kicker">PORTFOLIO</div><h2>Work</h2></div>
          <button className="btn btn-ghost" onClick={() => update("work", [...content.work, { id: newId(), name: "", desc: "", tag: "", slug: "", media: [], layers: [] }])}>+ Add work</button>
        </div>
        <p className="admin-help">Add as many photos or videos as you need. Drag files into the upload area or select multiple files. The first media item is the project cover.</p>

        {content.work.map((item, index) => (
          <div className="admin-card" key={item.id}>
            <div className="admin-card-top"><span className="admin-index">{String(index + 1).padStart(2, "0")}</span><span>{item.media?.length ?? 0} media</span></div>
            <input placeholder="Project name" value={item.name} onChange={(e) => updateWork(item.id, { name: e.target.value })} />
            <textarea placeholder="Description" value={item.desc} onChange={(e) => updateWork(item.id, { desc: e.target.value })} />
            <input placeholder="Tag, e.g. Brand · Motion" value={item.tag} onChange={(e) => updateWork(item.id, { tag: e.target.value })} />
            <input placeholder="Landing page URL slug, e.g. purple-tree" value={item.slug ?? ""} onChange={(e) => updateWork(item.id, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} />

            <div className={`upload-zone ${uploadingId === item.id ? "is-uploading" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, item.id)}>
              <input id={`upload-${item.id}`} className="file-input" type="file" accept="image/*,video/*,.mp4,.mov,.m4v,.webm" multiple onChange={(e) => { void uploadFiles(item.id, e.target.files ?? []); e.currentTarget.value = ""; }} />
              <label className="upload-label" htmlFor={`upload-${item.id}`}>
                <span className="upload-icon">＋</span>
                <span><strong>{uploadingId === item.id ? "Uploading media…" : "Add photos / videos"}</strong><small>Click to select multiple files or drag them here</small></span>
              </label>
            </div>
            {!!uploadProgress[item.id]?.length && (
              <div className="upload-progress-list">
                {uploadProgress[item.id].map((uploadItem, uploadIndex) => (
                  <div className="upload-progress-item" key={`${uploadItem.name}-${uploadIndex}`}>
                    <div className="upload-progress-top" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%" }}>
                      <span className="upload-progress-name" style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadItem.name}</span>
                      <span style={{ flex: "0 0 auto", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }} className={uploadItem.status === "error" ? "upload-progress-error" : "upload-progress-percent"}>
                        {uploadItem.status === "error" ? "Failed" : `${uploadItem.progress}%`}
                      </span>
                    </div>
                    <div className="upload-progress-track">
                      <div className={`upload-progress-bar ${uploadItem.status === "error" ? "is-error" : ""}`} style={{ width: `${uploadItem.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!!item.media?.length && <div className="admin-media-grid">
              {item.media.map((media, mediaIndex) => <div className="admin-media-card" key={media.id}>
                <div className="admin-media-preview">{media.type === "video" ? <video src={media.url} controls /> : <img src={media.url} alt={media.name ?? item.name} />}</div>
                <div className="admin-media-meta"><span>{String(mediaIndex + 1).padStart(2, "0")} / {media.type}</span><div className="admin-media-actions">
                  <button className="icon-btn" disabled={mediaIndex === 0} onClick={() => moveMedia(item.id, media.id, -1)}>←</button>
                  <button className="icon-btn" disabled={mediaIndex === item.media!.length - 1} onClick={() => moveMedia(item.id, media.id, 1)}>→</button>
                  <button className="icon-btn danger" onClick={() => removeMedia(item.id, media.id)}>×</button>
                </div></div>
              </div>)}
            </div>}
            <div className="landing-builder">
              <div className="landing-builder-head">
                <div><div className="admin-kicker">CUSTOM PAGE</div><h3>Landing page</h3></div>
                <span>{item.layers?.length ?? 0} layers</span>
              </div>
              <p className="admin-help">Build this project's own page from image, video, and text divider layers. Arrange them in the order you want, then save the site.</p>
              <label>Space between media</label>
              <select
                value={item.layerGap ?? "small"}
                onChange={(e) => updateWork(item.id, { layerGap: e.target.value as WorkItem["layerGap"] })}
              >
                <option value="none">None — images touch</option>
                <option value="small">Small</option>
                <option value="large">Large</option>
              </select>
              <div className="layer-add-row">
                <button className="btn btn-ghost" onClick={() => addLayer(item.id, "image")}>+ Image layer</button>
                <button className="btn btn-ghost" onClick={() => addLayer(item.id, "video")}>+ Video layer</button>
                <button className="btn btn-ghost" onClick={() => addLayer(item.id, "text")}>+ Text divider</button>
              </div>
              {!!item.layers?.length && <div className="landing-layers">
                {item.layers.map((layer, layerIndex) => <div className="landing-layer" key={layer.id}>
                  <div className="landing-layer-top">
                    <div><span className="admin-index">{String(layerIndex + 1).padStart(2, "0")}</span><span className="layer-type">{layer.type}</span></div>
                    <div className="admin-media-actions">
                      <button className="icon-btn" disabled={layerIndex === 0} onClick={() => moveLayer(item.id, layer.id, -1)}>↑</button>
                      <button className="icon-btn" disabled={layerIndex === item.layers!.length - 1} onClick={() => moveLayer(item.id, layer.id, 1)}>↓</button>
                      <button className="icon-btn danger" onClick={() => removeLayer(item.id, layer.id)}>×</button>
                    </div>
                  </div>
                  {layer.type === "text" ? (
                    <textarea className="layer-text-input" placeholder="Text divider" value={layer.text ?? ""} onChange={(e) => updateLayer(item.id, layer.id, { text: e.target.value })} />
                  ) : (
                    <>
                      {layer.url ? <div className="landing-layer-preview">{layer.type === "video" ? <video src={layer.url} controls /> : <img src={layer.url} alt={layer.name ?? item.name} />}</div> : <div className="landing-layer-empty">No {layer.type} selected yet.</div>}
                      <div className="layer-upload-row">
                        <label className="btn btn-ghost layer-upload-btn" htmlFor={`layer-${layer.id}`}>{uploadingLayerId === layer.id ? `Uploading ${layerProgress[layer.id] ?? 0}%` : layer.url ? `Replace ${layer.type}` : `Upload ${layer.type}`}</label>
                        <input id={`layer-${layer.id}`} className="file-input" type="file" accept={layer.type === "video" ? "video/*,.mp4,.mov,.m4v,.webm" : "image/*"} onChange={(e) => { void uploadLayerFile(item.id, layer.id, e.target.files?.[0]); e.currentTarget.value = ""; }} />
                        {uploadingLayerId === layer.id && <span className="layer-upload-percent">{layerProgress[layer.id] ?? 0}%</span>}
                      </div>
                    </>
                  )}
                </div>)}
              </div>}
            </div>

            <button className="btn btn-ghost danger-button" onClick={() => update("work", content.work.filter((w) => w.id !== item.id))}>Remove project</button>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <div className="admin-section-head"><h2>Testimonials</h2><button className="btn btn-ghost" onClick={() => update("testimonials", [...content.testimonials, { id: newId(), quote: "", who: "" } as Testimonial])}>+ Add testimonial</button></div>
        {content.testimonials.map((t) => <div className="admin-card" key={t.id}><textarea placeholder="Quote" value={t.quote} onChange={(e) => update("testimonials", content.testimonials.map((x) => x.id === t.id ? { ...x, quote: e.target.value } : x))} /><input placeholder="Name — role, company" value={t.who} onChange={(e) => update("testimonials", content.testimonials.map((x) => x.id === t.id ? { ...x, who: e.target.value } : x))} /><button className="btn btn-ghost danger-button" onClick={() => update("testimonials", content.testimonials.filter((x) => x.id !== t.id))}>Remove</button></div>)}
      </section>

      <section className="admin-section">
        <div className="admin-section-head"><div><div className="admin-kicker">IDENTITY</div><h2>Clients</h2></div><button className="btn btn-ghost" onClick={() => update("clients", [...content.clients, { id: newId(), name: "", logoUrl: "" }])}>+ Add client</button></div>
        <p className="admin-help">Upload a transparent logo for each client. Logos appear in one continuous horizontal row on the portfolio.</p>
        <div className="client-admin-list">
          {content.clients.map((client) => <div className="client-admin-card" key={client.id}>
            <div className="client-admin-logo">{client.logoUrl ? <img src={client.logoUrl} alt="" /> : <span>{client.name || "LOGO"}</span>}</div>
            <div className="client-admin-fields"><input placeholder="Client name" value={client.name} onChange={(e) => updateClient(client.id, { name: e.target.value })} /><div className="client-logo-actions"><label className="btn btn-ghost upload-logo-btn" htmlFor={`logo-${client.id}`}>{uploadingClientId === client.id ? "Uploading…" : client.logoUrl ? "Replace logo" : "Upload logo"}</label><input id={`logo-${client.id}`} className="file-input" type="file" accept="image/*" onChange={(e) => { void uploadClientLogo(client.id, e.target.files?.[0]); e.currentTarget.value = ""; }} />{client.logoUrl && <button className="btn btn-ghost danger-button" onClick={() => updateClient(client.id, { logoUrl: "" })}>Remove logo</button>}</div></div>
            <button className="icon-btn danger client-remove" onClick={() => update("clients", content.clients.filter((c) => c.id !== client.id))}>×</button>
          </div>)}
        </div>
      </section>

      <section className="admin-section">
        <h2>About</h2>
        {content.aboutParagraphs.map((p, i) => <textarea key={i} value={p} onChange={(e) => { const next = [...content.aboutParagraphs]; next[i] = e.target.value; update("aboutParagraphs", next); }} />)}
        <button className="btn btn-ghost" onClick={() => update("aboutParagraphs", [...content.aboutParagraphs, ""])}>+ Add paragraph</button>
      </section>
      <section className="admin-section"><h2>Contact email</h2><input value={content.email} onChange={(e) => update("email", e.target.value)} /></section>
    </div>
  );
}
