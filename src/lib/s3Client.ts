import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { 
  GetObjectCommandOutput, 
  PutObjectCommandOutput, 
  S3ClientConfig 
} from "@aws-sdk/client-s3";

// Leer variables de entorno de forma segura (soporta dos convenciones)
const region: string =
  process.env.SUPABASE_S3_REGION ?? process.env.S3_REGION ?? "us-east-1";

const endpoint: string | undefined =
  process.env.SUPABASE_S3_ENDPOINT ?? process.env.S3_ENDPOINT;

const accessKeyId: string | undefined =
  process.env.SUPABASE_S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID;

const secretAccessKey: string | undefined =
  process.env.SUPABASE_S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_ACCESS_KEY;

// Nombre de bucket por defecto (opcional)
const defaultBucket: string | undefined =
  process.env.SUPABASE_S3_BUCKET ?? process.env.S3_BUCKET;

// Construcción perezosa del cliente S3 para evitar errores en tiempo de importación
 
let _s3Client: S3Client | null = null;

function createS3Client(): S3Client {
  // Validación de credenciales
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3 credentials are missing. Set SUPABASE_S3_ACCESS_KEY_ID and SUPABASE_S3_SECRET_ACCESS_KEY (or S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY)."
    );
  }

  const config: S3ClientConfig = {
    region,
    forcePathStyle: true,
    credentials: { 
      accessKeyId, 
      secretAccessKey 
    },
    ...(endpoint && { endpoint }),
  };

   
  return new S3Client(config);
}

function getS3Client(): S3Client {
  _s3Client ??= createS3Client();
  return _s3Client;
}

// Subir objeto (retorno tipado)
export async function uploadObject(
  bucket: string = defaultBucket ?? "",
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType?: string
): Promise<PutObjectCommandOutput> {
  if (!bucket) {
    throw new Error("Bucket name is required for uploadObject.");
  }

   
  const client = getS3Client();
   
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

   
  return await client.send(cmd);
}

// Obtener objeto (retorno tipado)
export async function getObject(
  bucket: string = defaultBucket ?? "",
  key: string
): Promise<GetObjectCommandOutput> {
  if (!bucket) {
    throw new Error("Bucket name is required for getObject.");
  }

   
  const client = getS3Client();
   
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
     
    return await client.send(cmd);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get object from S3: ${error.message}`);
    } else if (typeof error === "string") {
      throw new Error(`Failed to get object from S3: ${error}`);
    } else {
      throw new Error("Failed to get object from S3: Unknown error");
    }
  }
}

// Exportar getter del cliente por si lo necesitas directamente
export function s3Client(): S3Client {
  return getS3Client();
}