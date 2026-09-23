import { list, put } from "@vercel/blob";
import { DEFAULT_CONTENT, SiteContent } from "./types";

const CONTENT_PATH = "content.json";

export async function getContent(): Promise<SiteContent> {
  try {
    const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === CONTENT_PATH);
    if (!match) return DEFAULT_CONTENT;

    // Add the blob's last-modified timestamp to bypass a stale public CDN/browser cache.
    const version = "uploadedAt" in match && match.uploadedAt
      ? new Date(match.uploadedAt).getTime()
      : Date.now();

    const res = await fetch(`${match.url}?v=${version}`, {
      cache: "no-store",
    });

    if (!res.ok) return DEFAULT_CONTENT;
    const data = await res.json();

    // Merge over defaults so a partially-filled file never breaks a section.
    return { ...DEFAULT_CONTENT, ...data };
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
