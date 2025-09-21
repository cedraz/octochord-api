import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService],
  //   controllers: [MinioController],
})
export class MinioModule {}
