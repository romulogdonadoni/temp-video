import {
  isR2Configured,
  generateR2UploadUrl,
  generateR2ViewUrl,
} from "./r2";
import {
  isDynamoDBConfigured,
  saveVideoMetadataToDynamo,
  getVideoMetadataFromDynamo,
  incrementVideoViewsInDynamo,
  deleteVideoFromDynamo,
  VideoMetadata,
} from "./dynamodb";

// Store local em memória/global para fallback em desenvolvimento
const globalForLocalStorage = global as unknown as {
  __localVideoStore?: Map<string, VideoMetadata & { blobData?: string }>;
};

if (!globalForLocalStorage.__localVideoStore) {
  globalForLocalStorage.__localVideoStore = new Map();
}

const localStore = globalForLocalStorage.__localVideoStore;

export async function createUploadSession(params: {
  id: string;
  title: string;
  size: number;
  mimeType: string;
  expirationHours: number; // ex: 1, 12, 24, 168 (7d) ou -1 (1 view)
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

  const useRealR2 = isR2Configured() && process.env.USE_LOCAL_FALLBACK !== "true";
  const useRealDynamo = isDynamoDBConfigured() && process.env.USE_LOCAL_FALLBACK !== "true";

  if (useRealR2 && useRealDynamo) {
    // 1. Gera URL assinado do R2
    const { uploadUrl } = await generateR2UploadUrl(fileKey, params.mimeType);
    // 2. Grava metadados no DynamoDB com TTL
    await saveVideoMetadataToDynamo(metadata);

    return {
      id: params.id,
      uploadUrl,
      isLocalFallback: false,
    };
  } else {
    // Salva no store local de fallback
    localStore.set(params.id, metadata);

    return {
      id: params.id,
      uploadUrl: `/api/upload/local?id=${params.id}`,
      isLocalFallback: true,
    };
  }
}

export async function getVideoSession(id: string): Promise<VideoMetadata | null> {
  const useRealDynamo = isDynamoDBConfigured() && process.env.USE_LOCAL_FALLBACK !== "true";
  const useRealR2 = isR2Configured() && process.env.USE_LOCAL_FALLBACK !== "true";

  let metadata: VideoMetadata | null = null;

  if (useRealDynamo) {
    metadata = await getVideoMetadataFromDynamo(id);
  } else {
    metadata = localStore.get(id) || null;
  }

  if (!metadata) return null;

  // Verifica expiração
  const nowSec = Math.floor(Date.now() / 1000);
  if (metadata.expiresAt <= nowSec) {
    if (!useRealDynamo) localStore.delete(id);
    return null;
  }

  // Gera URL de visualização
  let videoUrl = "";
  if (useRealR2) {
    videoUrl = await generateR2ViewUrl(metadata.fileKey);
  } else {
    const item = localStore.get(id);
    videoUrl = item?.videoUrl || `/api/video/${id}/stream`;
  }

  return {
    ...metadata,
    videoUrl,
  };
}

export async function recordVideoView(id: string): Promise<number> {
  const useRealDynamo = isDynamoDBConfigured() && process.env.USE_LOCAL_FALLBACK !== "true";

  if (useRealDynamo) {
    return await incrementVideoViewsInDynamo(id);
  } else {
    const item = localStore.get(id);
    if (!item) return 0;
    item.viewsCount = (item.viewsCount || 0) + 1;
    localStore.set(id, item);
    return item.viewsCount;
  }
}

export async function saveLocalVideoBlob(id: string, videoUrl: string) {
  const item = localStore.get(id);
  if (item) {
    item.videoUrl = videoUrl;
    localStore.set(id, item);
  }
}
