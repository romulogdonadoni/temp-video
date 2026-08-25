import { NextRequest, NextResponse } from "next/server";
import { generateNanoId } from "@/lib/utils";
import { createUploadSession } from "@/lib/storage-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, size, mimeType, expirationHours, password, burnAfterReading, allowDownload } = body;

    if (!title || !size || !mimeType) {
      return NextResponse.json(
        { error: "Título, tamanho e mimeType do vídeo são obrigatórios." },
        { status: 400 }
      );
    }

    const videoId = generateNanoId(12);

    const session = await createUploadSession({
      id: videoId,
      title,
      size,
      mimeType,
      expirationHours: Number(expirationHours) || 24,
      password: password || undefined,
      burnAfterReading: Boolean(burnAfterReading),
      allowDownload: allowDownload !== false,
    });

    return NextResponse.json({
      success: true,
      videoId: session.id,
      uploadUrl: session.uploadUrl,
      isLocalFallback: session.isLocalFallback,
    });
  } catch (error: any) {
    console.error("Erro na API presigned upload:", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao gerar sessão de upload." },
      { status: 500 }
    );
  }
}
