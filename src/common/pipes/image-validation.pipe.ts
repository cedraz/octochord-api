import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Injectable()
export class imageValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    const formats = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg'];

    if (!value) {
      throw new BadRequestException(ErrorMessagesHelper.FILE_NOT_FOUND);
    }

    if (!formats.includes(value.mimetype)) {
      throw new BadRequestException(ErrorMessagesHelper.INVALID_IMAGE_FORMAT);
    }

    const maxSizeInBytes = 25 * 1024 * 1024; // 25MB

    if (value.size > maxSizeInBytes) {
      throw new BadRequestException(
        ErrorMessagesHelper.fileSizeLimitExceeded('25MB'),
      );
    }

    return value;
  }
}
