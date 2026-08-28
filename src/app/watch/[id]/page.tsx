import type { Metadata } from "next";
import { getVideoSession } from "@/lib/storage-store";
import { headers } from "next/headers";
import WatchClientView from "./WatchClientView";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  
  try {
    const video = await getVideoSession(id);

    if (!video) {
      return {
        title: "Vídeo Expirado - VideoVault",
        description: "Este vídeo temporário expirou ou não existe mais no VideoVault.",
      };
    }

    const isPrivateOrBurn = Boolean(video.passwordHash) || Boolean(video.burnAfterReading);

    // Resolver a URL base absoluta para meta tags do Discord e Twitter
    const headerList = headers();
    const host = headerList.get("host") || "localhost:3000";
    const protocol = headerList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const title = video.title ? `${video.title} | VideoVault` : "Vídeo Temporário | VideoVault";
    const description = isPrivateOrBurn
      ? "Vídeo temporário protegido no VideoVault."
      : `Assista a "${video.title}" no VideoVault. Player de vídeo temporário com expiração automática.`;

    let videoStreamUrl = "";
    if (!isPrivateOrBurn) {
      if (video.videoUrl?.startsWith("http")) {
        videoStreamUrl = video.videoUrl;
      } else if (video.videoUrl) {
        videoStreamUrl = `${baseUrl}${video.videoUrl}`;
      } else {
        videoStreamUrl = `${baseUrl}/api/video/${id}/stream`;
      }
    }

    const mimeType = video.mimeType || "video/mp4";

    return {
      title,
      description,
      openGraph: {
        title: video.title,
        description,
        siteName: "VideoVault",
        type: isPrivateOrBurn ? "website" : ("video.other" as any),
        ...(isPrivateOrBurn
          ? {}
          : {
              videos: [
                {
                  url: videoStreamUrl,
                  secureUrl: videoStreamUrl,
                  type: mimeType,
                  width: 1280,
                  height: 720,
                },
              ],
            }),
      },
      twitter: {
        card: isPrivateOrBurn ? "summary" : "player",
        title: video.title,
        description,
        ...(isPrivateOrBurn
          ? {}
          : {
              players: [
                {
                  playerUrl: `${baseUrl}/watch/${id}`,
                  streamUrl: videoStreamUrl,
                  width: 1280,
                  height: 720,
                },
              ],
            }),
      },
    };
  } catch (error) {
    console.error("Erro ao gerar metadados OpenGraph:", error);
    return {
      title: "VideoVault | Vídeo Temporário",
      description: "Compartilhamento de vídeos temporários com expiração automática.",
    };
  }
}

export default function Page() {
  return <WatchClientView />;
}
