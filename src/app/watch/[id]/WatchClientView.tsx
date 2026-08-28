"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ExpirationBadge from "@/components/ExpirationBadge";
import VideoPlayer from "@/components/VideoPlayer";
import ExpiredScreen from "@/components/ExpiredScreen";
import PasswordModal from "@/components/PasswordModal";
import ShareModal from "@/components/ShareModal";
import { Loader2, ArrowLeft, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoData {
  id: string;
  title: string;
  size?: number;
  mimeType?: string;
  createdAt?: number;
  expiresAt: number;
  videoUrl?: string;
  viewsCount?: number;
  burnAfterReading?: boolean;
  allowDownload?: boolean;
  isProtected?: boolean;
  requiresPassword?: boolean;
}

export default function WatchClientView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const deleteKey = searchParams?.get("delete");

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [isDeletedByDev, setIsDeletedByDev] = useState(false);
  const [passwordToken, setPasswordToken] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const fetchVideo = async (token?: string) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["x-video-password"] = token;

      let apiUrl = `/api/video/${id}`;
      if (deleteKey) {
        apiUrl += `?delete=${encodeURIComponent(deleteKey)}`;
      }

      const res = await fetch(apiUrl, { headers });
      const data = await res.json();

      if (data.deleted) {
        setIsDeletedByDev(true);
        setVideoData(null);
        return;
      }

      if (res.status === 404) {
        setIsExpired(true);
        setVideoData(null);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar o vídeo.");
      }

      setVideoData(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Não foi possível carregar este vídeo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id, deleteKey]);

  const handlePasswordSuccess = (token: string) => {
    setPasswordToken(token);
    fetchVideo(token);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-xs font-medium text-zinc-400 font-mono">Carregando vídeo...</p>
      </div>
    );
  }

  if (isDeletedByDev) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-zinc-800 bg-zinc-950">
          <CardHeader className="pb-2">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-950 text-red-400 border border-red-800/50">
              <Trash2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-bold text-zinc-100">Vídeo Deletado (Dev Key)</CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">
              O vídeo foi removido permanentemente do Cloudflare R2 e da memória.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Voltar para o Início
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isExpired || !videoData) {
    return <ExpiredScreen message={errorMsg} />;
  }

  if (videoData.requiresPassword && !passwordToken) {
    return (
      <PasswordModal
        videoId={videoData.id}
        videoTitle={videoData.title}
        onSuccess={handlePasswordSuccess}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Barra Superior */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Início
          </Link>

          <div className="flex items-center gap-3">
            {videoData.burnAfterReading && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-800/50 bg-pink-950/40 px-3 py-1 text-xs font-semibold text-pink-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                Visualização Única
              </span>
            )}
            <ExpirationBadge
              expiresAt={videoData.expiresAt}
              onExpired={() => setIsExpired(true)}
            />
          </div>
        </div>

        {/* Player de Vídeo */}
        {videoData.videoUrl ? (
          <VideoPlayer
            src={videoData.videoUrl}
            title={videoData.title}
            size={videoData.size}
            viewsCount={videoData.viewsCount}
            allowDownload={videoData.allowDownload}
            onShareClick={() => setIsShareOpen(true)}
          />
        ) : (
          <div className="rounded-md border border-red-900/50 bg-red-950/30 p-6 text-center text-xs text-red-300">
            Falha ao obter URL de reprodução do vídeo.
          </div>
        )}
      </div>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        videoId={videoData.id}
        videoTitle={videoData.title}
      />
    </div>
  );
}
