import { NextRequest, NextResponse } from "next/server";
import { saveLocalVideoBlob, saveLocalBlobBuffer } from "@/lib/storage-store";

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

    saveLocalBlobBuffer(id, buffer, contentType);

    // Atualiza o store com a URL de streaming local
    await saveLocalVideoBlob(id, `/api/video/${id}/stream`);

    return NextResponse.json({ success: true, message: "Upload concluído localmente" });
  } catch (err: any) {
    console.error("Erro no upload local:", err);
    return NextResponse.json({ error: "Falha ao receber upload" }, { status: 500 });
  }
}
