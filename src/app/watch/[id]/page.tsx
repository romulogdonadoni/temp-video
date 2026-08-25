"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExpirationBadge from "@/components/ExpirationBadge";
import VideoPlayer from "@/components/VideoPlayer";
import ExpiredScreen from "@/components/ExpiredScreen";
import PasswordModal from "@/components/PasswordModal";
import ShareModal from "@/components/ShareModal";
import { Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

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

export default function WatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [passwordToken, setPasswordToken] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const fetchVideo = async (token?: string) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["x-video-password"] = token;

      const res = await fetch(`/api/video/${id}`, { headers });
      if (res.status === 404) {
        setIsExpired(true);
        setVideoData(null);
        return;
      }

      const data = await res.json();
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
  }, [id]);

  const handlePasswordSuccess = (token: string) => {
    setPasswordToken(token);
    fetchVideo(token);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-zinc-400">Carregando player de vídeo...</p>
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
        {/* Top Action Bar */}
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                Visualização Única (Burn)
              </span>
            )}
            <ExpirationBadge
              expiresAt={videoData.expiresAt}
              onExpired={() => setIsExpired(true)}
            />
          </div>
        </div>

        {/* Player Section */}
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
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-400">
            Falha ao carregar a URL do arquivo de vídeo.
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
