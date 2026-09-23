import { handleUpload } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const response = await handleUpload({
      body: json,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "video/*"],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Blob upload error", error);
    return NextResponse.json(
      { error: "Could not prepare upload." },
      { status: 500 }
    );
  }
}
