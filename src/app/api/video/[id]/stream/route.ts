import { NextRequest, NextResponse } from "next/server";
import { localBlobs } from "@/app/api/upload/local/route";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const videoData = localBlobs.get(id);

  if (!videoData) {
    return new NextResponse("Vídeo não encontrado ou expirado no servidor local", { status: 404 });
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", videoData.mimeType);
  responseHeaders.set("Content-Length", videoData.buffer.length.toString());
  responseHeaders.set("Accept-Ranges", "bytes");

  return new NextResponse(videoData.buffer, {
    status: 200,
    headers: responseHeaders,
  });
}
