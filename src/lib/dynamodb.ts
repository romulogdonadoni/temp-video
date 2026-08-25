import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const tableName = process.env.DYNAMODB_TABLE_NAME || "TempVideos";

export interface VideoMetadata {
  id: string;
  fileKey: string;
  title: string;
  size: number;
  mimeType: string;
  createdAt: number; // Unix seconds
  expiresAt: number; // Unix seconds (DynamoDB TTL)
  passwordHash?: string | null;
  viewsCount: number;
  burnAfterReading: boolean;
  allowDownload: boolean;
  videoUrl?: string;
}

export function isDynamoDBConfigured(): boolean {
  return Boolean(accessKeyId && secretAccessKey);
}

function getDynamoDocClient() {
  const client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  return DynamoDBDocumentClient.from(client);
}

export async function saveVideoMetadataToDynamo(data: VideoMetadata): Promise<void> {
  if (!isDynamoDBConfigured()) {
    throw new Error("AWS DynamoDB não está configurado nas variáveis de ambiente.");
  }

  const docClient = getDynamoDocClient();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        ...data,
        ttl: data.expiresAt, // Campo nativo do DynamoDB para TTL (Time To Live)
      },
    })
  );
}

export async function getVideoMetadataFromDynamo(id: string): Promise<VideoMetadata | null> {
  if (!isDynamoDBConfigured()) {
    throw new Error("AWS DynamoDB não está configurado nas variáveis de ambiente.");
  }

  const docClient = getDynamoDocClient();
  const response = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { id },
    })
  );

  if (!response.Item) return null;

  const item = response.Item as VideoMetadata;

  // Checa expiração manual para garantir mesmo antes do ciclo de varredura do TTL da AWS
  const nowSec = Math.floor(Date.now() / 1000);
  if (item.expiresAt <= nowSec) {
    return null;
  }

  return item;
}

export async function incrementVideoViewsInDynamo(id: string): Promise<number> {
  if (!isDynamoDBConfigured()) return 1;

  const docClient = getDynamoDocClient();
  const response = await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: "ADD viewsCount :inc",
      ExpressionAttributeValues: { ":inc": 1 },
      ReturnValues: "UPDATED_NEW",
    })
  );

  return response.Attributes?.viewsCount || 1;
}

export async function deleteVideoFromDynamo(id: string): Promise<void> {
  if (!isDynamoDBConfigured()) return;

  const docClient = getDynamoDocClient();
  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { id },
    })
  );
}
