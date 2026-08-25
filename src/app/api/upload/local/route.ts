import { NextRequest, NextResponse } from "next/server";
import { saveLocalVideoBlob } from "@/lib/storage-store";

// Map em memória no servidor para guardar os buffers de arquivo no fallback local
const globalForBlobs = global as unknown as {
  __localVideoBlobs?: Map<string, { buffer: Buffer; mimeType: string }>;
};

if (!globalForBlobs.__localVideoBlobs) {
  globalForBlobs.__localVideoBlobs = new Map();
}

export const localBlobs = globalForBlobs.__localVideoBlobs;

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do vídeo ausente" }, { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "video/mp4";
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    localBlobs.set(id, { buffer, mimeType: contentType });

    // Atualiza o store com a URL de streaming local
    await saveLocalVideoBlob(id, `/api/video/${id}/stream`);

    return NextResponse.json({ success: true, message: "Upload concluído localmente" });
  } catch (err: any) {
    console.error("Erro no upload local:", err);
    return NextResponse.json({ error: "Falha ao receber upload" }, { status: 500 });
  }
}
