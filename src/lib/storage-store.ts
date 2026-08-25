import {
  isR2Configured,
  generateR2UploadUrl,
  generateR2ViewUrl,
  findR2VideoObject,
  deleteR2VideoObjects,
} from "./r2";
import {
  saveVideoMetadata,
  getVideoMetadata,
  incrementVideoViews,
  deleteVideoMetadata,
  VideoMetadata,
} from "./metadata-store";

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
    const { uploadUrl } = await generateR2UploadUrl(fileKey, params.mimeType);
    await saveVideoMetadata(metadata);

    return {
      id: params.id,
      uploadUrl,
      isLocalFallback: false,
    };
  } else {
    await saveVideoMetadata(metadata);
    return {
      id: params.id,
      uploadUrl: `/api/upload/local?id=${params.id}`,
      isLocalFallback: true,
    };
  }
}

export async function getVideoSession(id: string): Promise<VideoMetadata | null> {
  let metadata = await getVideoMetadata(id);
  const useR2 = isR2Configured() && process.env.USE_LOCAL_FALLBACK !== "true";

  if (!metadata && useR2) {
    const r2Item = await findR2VideoObject(id);
    if (r2Item) {
      const nowSec = Math.floor(Date.now() / 1000);
      const createdSec = r2Item.lastModified ? Math.floor(r2Item.lastModified.getTime() / 1000) : nowSec;
      const expiresAt = createdSec + 24 * 3600;

      if (expiresAt > nowSec) {
        metadata = {
          id,
          fileKey: r2Item.fileKey,
          title: r2Item.title,
          size: r2Item.size,
          mimeType: "video/mp4",
          createdAt: createdSec,
          expiresAt,
          viewsCount: 1,
          burnAfterReading: false,
          allowDownload: true,
        };
        await saveVideoMetadata(metadata);
      }
    }
  }

  if (!metadata) return null;

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

export async function deleteVideoSession(id: string): Promise<boolean> {
  const useR2 = isR2Configured() && process.env.USE_LOCAL_FALLBACK !== "true";
  if (useR2) {
    await deleteR2VideoObjects(id);
  }
  await deleteVideoMetadata(id);
  localBlobs.delete(id);
  return true;
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
