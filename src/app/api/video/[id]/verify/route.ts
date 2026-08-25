import { NextRequest, NextResponse } from "next/server";
import { getVideoSession } from "@/lib/storage-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { password } = await req.json();

    const metadata = await getVideoSession(id);

    if (!metadata) {
      return NextResponse.json({ error: "Vídeo expirado ou não encontrado." }, { status: 404 });
    }

    if (!metadata.passwordHash) {
      return NextResponse.json({ success: true });
    }

    if (metadata.passwordHash === password) {
      return NextResponse.json({ success: true, token: password });
    } else {
      return NextResponse.json({ error: "Senha incorreta. Tente novamente." }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Falha na verificação da senha" }, { status: 500 });
  }
}
