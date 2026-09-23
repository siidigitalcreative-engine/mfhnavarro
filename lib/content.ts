import { list, put } from "@vercel/blob";
import { DEFAULT_CONTENT, SiteContent, WorkItem, MediaItem, ClientItem } from "./types";

const CONTENT_PATH = "content.json";

function normalizeClient(item: ClientItem | string, index: number): ClientItem {
  if (typeof item === "string") return { id: `client-${index + 1}`, name: item };
  return { ...item, id: item.id || `client-${index + 1}` };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizeWork(item: WorkItem): WorkItem {
  const media = item.media?.length
    ? item.media
    : item.mediaUrl
      ? [{ id: `${item.id}-legacy`, url: item.mediaUrl, type: item.mediaType === "video" ? "video" : "image" } as MediaItem]
      : [];

  return {
    ...item,
    slug: item.slug || slugify(item.name) || item.id,
    media,
    layers: Array.isArray(item.layers) ? item.layers : [],
  };
}

export async function getContent(): Promise<SiteContent> {
  try {
    const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === CONTENT_PATH);
    if (!match) return DEFAULT_CONTENT;

    const version = "uploadedAt" in match && match.uploadedAt
      ? new Date(match.uploadedAt).getTime()
      : Date.now();
    const res = await fetch(`${match.url}?v=${version}`, { cache: "no-store" });
    if (!res.ok) return DEFAULT_CONTENT;

    const data = (await res.json()) as Partial<SiteContent>;
    const work = Array.isArray(data.work) ? data.work.map(normalizeWork) : DEFAULT_CONTENT.work;
    const clients = Array.isArray(data.clients) ? data.clients.map(normalizeClient) : DEFAULT_CONTENT.clients;

    return { ...DEFAULT_CONTENT, ...data, work, clients };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  await put(CONTENT_PATH, JSON.stringify(content, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}
