import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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

  // Se houver um domínio público configurado (ex: R2 dev domain ou custom CDN domain)
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
