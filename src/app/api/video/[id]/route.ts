import { NextRequest, NextResponse } from "next/server";
import { getVideoSession, recordVideoView } from "@/lib/storage-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const metadata = await getVideoSession(id);

    if (!metadata) {
      return NextResponse.json(
        { error: "Vídeo não encontrado ou já expirou." },
        { status: 404 }
      );
    }

    // Se o vídeo for protegido por senha e nenhuma senha correta foi enviada nos parâmetros ou cabeçalhos
    const authHeader = req.headers.get("x-video-password");
    const isProtected = Boolean(metadata.passwordHash);

    if (isProtected && authHeader !== metadata.passwordHash) {
      return NextResponse.json({
        id: metadata.id,
        title: metadata.title,
        isProtected: true,
        expiresAt: metadata.expiresAt,
        requiresPassword: true,
      });
    }

    // Incrementa contagem de views se não estiver apenas checando senha
    const newViews = await recordVideoView(id);

    return NextResponse.json({
      id: metadata.id,
      title: metadata.title,
      size: metadata.size,
      mimeType: metadata.mimeType,
      createdAt: metadata.createdAt,
      expiresAt: metadata.expiresAt,
      videoUrl: metadata.videoUrl,
      viewsCount: newViews,
      burnAfterReading: metadata.burnAfterReading,
      allowDownload: metadata.allowDownload,
      isProtected: false,
    });
  } catch (error: any) {
    console.error("Erro ao carregar metadados do vídeo:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar vídeo." },
      { status: 500 }
    );
  }
}
