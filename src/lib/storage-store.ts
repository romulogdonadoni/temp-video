import {
  isR2Configured,
  generateR2UploadUrl,
  generateR2ViewUrl,
} from "./r2";
import {
  saveVideoMetadata,
  getVideoMetadata,
  incrementVideoViews,
  VideoMetadata,
} from "./metadata-store";

// Store local para arquivos em fallback (quando R2 não estiver configurado)
const globalForBlobs = global as unknown as {
  __localVideoBlobs?: Map<string, { buffer: Buffer; mimeType: string }>;
};

if (!globalForBlobs.__localVideoBlobs) {
  globalForBlobs.__localVideoBlobs = new Map();
}

const localBlobs = globalForBlobs.__localVideoBlobs;

export function saveLocalBlobBuffer(id: string, buffer: Buffer, mimeType: string) {
  localBlobs.set(id, { buffer, mimeType });
}

export function getLocalBlobBuffer(id: string) {
  return localBlobs.get(id);
}

export async function createUploadSession(params: {
  id: string;
  title: string;
  size: number;
  mimeType: string;
  expirationHours: number;
  password?: string;
  burnAfterReading?: boolean;
  allowDownload?: boolean;
}) {
  const nowSec = Math.floor(Date.now() / 1000);
  const durationSec = params.expirationHours > 0 ? params.expirationHours * 3600 : 24 * 3600;
  const expiresAt = nowSec + durationSec;
  const fileKey = `videos/${params.id}/${params.title.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const metadata: VideoMetadata = {
    id: params.id,
    fileKey,
    title: params.title,
    size: params.size,
    mimeType: params.mimeType,
    createdAt: nowSec,
    expiresAt,
    passwordHash: params.password ? params.password : null,
    viewsCount: 0,
    burnAfterReading: Boolean(params.burnAfterReading),
    allowDownload: params.allowDownload !== false,
  };

  const useR2 = isR2Configured() && process.env.USE_LOCAL_FALLBACK !== "true";

  if (useR2) {
    // 1. Gera URL assinado no Cloudflare R2
    const { uploadUrl } = await generateR2UploadUrl(fileKey, params.mimeType);
    // 2. Salva metadados em memória com TTL
    await saveVideoMetadata(metadata);

    return {
      id: params.id,
      uploadUrl,
      isLocalFallback: false,
    };
  } else {
    // Fallback local
    await saveVideoMetadata(metadata);
    return {
      id: params.id,
      uploadUrl: `/api/upload/local?id=${params.id}`,
      isLocalFallback: true,
    };
  }
}

export async function getVideoSession(id: string): Promise<VideoMetadata | null> {
  const metadata = await getVideoMetadata(id);
  if (!metadata) return null;

  const useR2 = isR2Configured() && process.env.USE_LOCAL_FALLBACK !== "true";

  let videoUrl = "";
  if (useR2) {
    videoUrl = await generateR2ViewUrl(metadata.fileKey);
  } else {
    videoUrl = metadata.videoUrl || `/api/video/${id}/stream`;
  }

  return {
    ...metadata,
    videoUrl,
  };
}

export async function recordVideoView(id: string): Promise<number> {
  return await incrementVideoViews(id);
}

export async function saveLocalVideoBlob(id: string, videoUrl: string) {
  const metadata = await getVideoMetadata(id);
  if (metadata) {
    metadata.videoUrl = videoUrl;
    await saveVideoMetadata(metadata);
  }
}
