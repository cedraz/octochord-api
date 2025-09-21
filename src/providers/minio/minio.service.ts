import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import * as Minio from 'minio';
import { MinIOResponse } from './types/minio-response';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { env } from 'src/shared/config/env.schema';

@Injectable()
export class MinioService {
  private readonly bucketName = env.MINIO_BUCKET_NAME;
  private readonly minioSecretAccessKey = env.MINIO_SECRET_ACCESS_KEY;
  private readonly minioAccessKeyId = env.MINIO_ACCESS_KEY_ID;
  private readonly minioRegion = env.MINIO_REGION;
  private readonly minioEndpoint = env.MINIO_ENDPOINT;
  private readonly minioClient: Minio.Client;

  constructor() {
    try {
      this.minioClient = new Minio.Client({
        endPoint: this.minioEndpoint,
        accessKey: this.minioAccessKeyId,
        secretKey: this.minioSecretAccessKey,
        useSSL: true,
        region: this.minioRegion,
        port: 443,
      });
    } catch (error) {
      console.log('Error initializing Minio client:', error);
      throw error;
    }
  }

  async makeBucket() {
    try {
      await this.minioClient.makeBucket(this.bucketName);
      console.log(`Bucket "${this.bucketName}" created successfully.`);
    } catch (err) {
      console.error(`Error creating bucket "${this.bucketName}":`, err);
      throw new ServiceUnavailableException(
        ErrorMessagesHelper.MINIO_UNAVAILABLE,
      );
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<MinIOResponse> {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);

    if (!bucketExists) {
      throw new ServiceUnavailableException(
        ErrorMessagesHelper.MINIO_BUCKET_NOT_FOUND,
      );
    }

    try {
      const metaData = { 'Content-Type': file.mimetype };

      await this.minioClient.putObject(
        this.bucketName,
        file.originalname,
        file.buffer,
        file.size,
        metaData,
      );

      return {
        url: `https://${this.minioEndpoint}/${this.bucketName}/${file.originalname}`,
      };
    } catch (err) {
      console.error('Error uploading object:', err);
      throw new ServiceUnavailableException(
        ErrorMessagesHelper.MINIO_UPLOAD_ERROR,
      );
    }
  }
}
