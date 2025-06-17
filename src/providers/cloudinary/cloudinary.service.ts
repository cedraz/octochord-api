import { Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 } from 'cloudinary';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          folder: 'avatars', // Opcional: pasta para organização
          resource_type: 'auto', // Detecta automaticamente se é imagem/video
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(new Error(ErrorMessagesHelper.CLOUDINARY_UPLOAD_ERROR));
            return;
          }
          if (!result) {
            reject(new Error('Upload failed with unknown error'));
            return;
          }
          resolve(result);
        },
      );

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }
}
