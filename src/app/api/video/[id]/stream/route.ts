import { NextRequest, NextResponse } from "next/server";
import { getLocalBlobBuffer } from "@/lib/storage-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const videoData = getLocalBlobBuffer(id);

  if (!videoData) {
    return new NextResponse("Vídeo não encontrado ou expirado no servidor local", { status: 404 });
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", videoData.mimeType);
  responseHeaders.set("Content-Length", videoData.buffer.length.toString());
  responseHeaders.set("Accept-Ranges", "bytes");

  return new NextResponse(new Uint8Array(videoData.buffer), {
    status: 200,
    headers: responseHeaders,
  });
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const videoData = getLocalBlobBuffer(id);

  if (!videoData) {
    return new NextResponse(null, { status: 404 });
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", videoData.mimeType);
  responseHeaders.set("Content-Length", videoData.buffer.length.toString());
  responseHeaders.set("Accept-Ranges", "bytes");

  return new NextResponse(null, {
    status: 200,
    headers: responseHeaders,
  });
}

