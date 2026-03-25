import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3UploadResult, S3ContentType } from "../interfaces/s3.interface";
import { Readable } from "stream";
import { BaseService } from "./BaseService";

export class S3Service extends BaseService {
    private readonly client: S3Client;
    private readonly bucketName: string;

    constructor () {
        super();
        this.client = this.createClient();
        this.bucketName = this.validateEnvVar("AWS_BUCKET_NAME");
    }

    private createClient(): S3Client {
        return new S3Client({
            region: this.validateEnvVar("AWS_REGION")
        });
    }

    // Helper para convertir el stream a un string (uso interno)
    private streamToString(stream: Readable, encoding: BufferEncoding = 'utf-8'): Promise<string> {

        if (!stream) {
            return Promise.reject(new Error('Stream no definido'));
        }

        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk: Buffer) => chunks.push(chunk));
            stream.on('error', (error: Error) => reject(error));
            stream.on('end', () => resolve(Buffer.concat(chunks).toString(encoding)));
        });
    }

    // Helper para subir archivos al Bucket S3
    async uploadToS3( key: string, body: Buffer, contentType: S3ContentType ): Promise<S3UploadResult> {
        
        if (!key || !body || !contentType) {
            throw new Error(`Parametros incompletos: key=${key}, contentType=${contentType}`);
        }

        if (!this.bucketName) {
            throw new Error(`❌ AWS_BUCKET_NAME no configurado en las variables de entorno`);
        }

        await this.client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        }));

        console.log(`✅ Subido a S3: ${key}`);
        return { key, bucket: this.bucketName!, contentType };
    }

    // Helper para obtener archivo de S3
    async getFromS3(key: string): Promise<string> {

        if (!key) {
            throw new Error(`❌ Key requerida para obtener archivo de S3`);
        }

        const response = await this.client.send(new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        }));

        if (!response.Body) {
            throw new Error(`S3 no retorno Body para key: ${key}`);
        }

        return this.streamToString(response.Body as Readable);
    }
}