export interface VideoMetadata {
  id: string;
  fileKey: string;
  title: string;
  size: number;
  mimeType: string;
  createdAt: number; // Unix timestamp em segundos
  expiresAt: number; // Unix timestamp em segundos
  passwordHash?: string | null;
  viewsCount: number;
  burnAfterReading: boolean;
  allowDownload: boolean;
  videoUrl?: string;
}

const globalForStore = global as unknown as {
  __videoMetadataStore?: Map<string, VideoMetadata>;
};

if (!globalForStore.__videoMetadataStore) {
  globalForStore.__videoMetadataStore = new Map();
}

const metadataStore = globalForStore.__videoMetadataStore;

export async function saveVideoMetadata(data: VideoMetadata): Promise<void> {
  metadataStore.set(data.id, data);
}

export async function getVideoMetadata(id: string): Promise<VideoMetadata | null> {
  const metadata = metadataStore.get(id);
  if (!metadata) return null;

  // Checa expiração por TTL
  const nowSec = Math.floor(Date.now() / 1000);
  if (metadata.expiresAt <= nowSec) {
    metadataStore.delete(id);
    return null;
  }

  return metadata;
}

export async function incrementVideoViews(id: string): Promise<number> {
  const metadata = metadataStore.get(id);
  if (!metadata) return 0;

  metadata.viewsCount = (metadata.viewsCount || 0) + 1;
  metadataStore.set(id, metadata);

  // Se a opção Burn After Reading estiver ativada e o vídeo foi visto 1 vez
  if (metadata.burnAfterReading && metadata.viewsCount >= 1) {
    // Agenda exclusão do registro após a reprodução
    setTimeout(() => {
      metadataStore.delete(id);
    }, 5000);
  }

  return metadata.viewsCount;
}

export async function deleteVideoMetadata(id: string): Promise<void> {
  metadataStore.delete(id);
}
