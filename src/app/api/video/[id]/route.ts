import { NextRequest, NextResponse } from "next/server";
import { getVideoSession, recordVideoView, deleteVideoSession } from "@/lib/storage-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const deleteKeyParam = searchParams.get("delete");
    const configuredDevKey = process.env.DEV_DELETE_KEY || "devkey";

    // Se o parâmetro ?delete=CHAVE for fornecido e corresponder à chave DEV_DELETE_KEY
    if (deleteKeyParam && configuredDevKey && deleteKeyParam === configuredDevKey) {
      await deleteVideoSession(id);
      return NextResponse.json({
        success: true,
        deleted: true,
        message: "Vídeo deletado com sucesso do Cloudflare R2 via Dev Key.",
      });
    }

    const metadata = await getVideoSession(id);

    if (!metadata) {
      return NextResponse.json(
        { error: "Vídeo não encontrado ou já expirou." },
        { status: 404 }
      );
    }

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const deleteKeyParam = searchParams.get("delete") || req.headers.get("x-dev-key");
    const configuredDevKey = process.env.DEV_DELETE_KEY || "devkey";

    if (!deleteKeyParam || deleteKeyParam !== configuredDevKey) {
      return NextResponse.json(
        { error: "Chave dev inválida para exclusão." },
        { status: 403 }
      );
    }

    await deleteVideoSession(id);
    return NextResponse.json({
      success: true,
      deleted: true,
      message: "Vídeo deletado permanentemente do Cloudflare R2.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Falha ao deletar vídeo." }, { status: 500 });
  }
}
