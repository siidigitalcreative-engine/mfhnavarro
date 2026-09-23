import { NextRequest, NextResponse } from "next/server";
import { getContent, saveContent } from "@/lib/content";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import type { SiteContent } from "@/lib/types";

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(
      { error: "Could not load site content." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = (await req.json()) as SiteContent;
    await saveContent(content);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not save site content." },
      { status: 500 }
    );
  }
}
