import { list, put } from "@vercel/blob";
import { DEFAULT_CONTENT, SiteContent, WorkItem, MediaItem, ClientItem } from "./types";

const CONTENT_PATH = "content.json";

function normalizeClient(item: ClientItem | string, index: number): ClientItem {
  if (typeof item === "string") {
    return { id: `client-${index + 1}`, name: item };
  }
  return { ...item, id: item.id || `client-${index + 1}` };
}

function normalizeWork(item: WorkItem): WorkItem {
  if (item.media?.length) return item;

  if (item.mediaUrl) {
    return {
      ...item,
      media: [
        {
          id: `${item.id}-legacy`,
          url: item.mediaUrl,
          type: item.mediaType === "video" ? "video" : "image",
        },
      ],
    };
  }

  return { ...item, media: [] };
}

export async function getContent(): Promise<SiteContent> {
  try {
    const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === CONTENT_PATH);
    if (!match) return DEFAULT_CONTENT;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_CONTENT;
    const data = (await res.json()) as Partial<SiteContent>;
    const work = Array.isArray(data.work)
      ? data.work.map(normalizeWork)
      : DEFAULT_CONTENT.work;
    const clients = Array.isArray(data.clients)
      ? data.clients.map(normalizeClient)
      : DEFAULT_CONTENT.clients;

    return {
      ...DEFAULT_CONTENT,
      ...data,
      work,
      clients,
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  await put(CONTENT_PATH, JSON.stringify(content, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
