import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.R2_BUCKET_NAME || "temp-videos";

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey);
}

export function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function generateR2UploadUrl(
  fileKey: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<{ uploadUrl: string; fileKey: string }> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 não está configurado nas variáveis de ambiente.");
  }

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { uploadUrl, fileKey };
}

export async function generateR2ViewUrl(
  fileKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 não está configurado nas variáveis de ambiente.");
  }

  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  if (publicDomain && publicDomain.startsWith("http")) {
    return `${publicDomain.replace(/\/$/, "")}/${fileKey}`;
  }

  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function findR2VideoObject(id: string): Promise<{
  fileKey: string;
  size: number;
  lastModified?: Date;
  title: string;
} | null> {
  if (!isR2Configured()) return null;

  try {
    const client = getR2Client();
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `videos/${id}/`,
    });

    const response = await client.send(command);
    if (!response.Contents || response.Contents.length === 0) {
      return null;
    }

    const item = response.Contents[0];
    if (!item.Key) return null;

    const parts = item.Key.split("/");
    const filename = parts[parts.length - 1] || "video.mp4";
    const title = filename.replace(/_/g, " ");

    return {
      fileKey: item.Key,
      size: item.Size || 0,
      lastModified: item.LastModified,
      title,
    };
  } catch (err) {
    console.error("Erro ao buscar objeto no R2:", err);
    return null;
  }
}

export async function deleteR2VideoObjects(id: string): Promise<boolean> {
  if (!isR2Configured()) return false;

  try {
    const client = getR2Client();
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `videos/${id}/`,
    });

    const response = await client.send(listCommand);
    if (response.Contents && response.Contents.length > 0) {
      for (const item of response.Contents) {
        if (item.Key) {
          await client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: item.Key,
            })
          );
        }
      }
    }
    return true;
  } catch (err) {
    console.error("Erro ao deletar arquivo do Cloudflare R2:", err);
    return false;
  }
}
