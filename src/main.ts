import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { CustomLogger } from './shared/logger/logger.service';
import { GlobalErrorFilter } from './shared/filters/global-error.filter';
import { AppModule } from './app.module';
import { env } from './shared/config/env.schema';

async function bootstrap() {
  console.time('server-started');

  const logger = new CustomLogger();

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Nest API Template Prisma API Docs')
    .setDescription('The Nest API Template Prisma API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  app.useGlobalFilters(new GlobalErrorFilter(logger));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = env.PORT;
  await app.listen(port, '0.0.0.0');

  console.log(`
    Server running in http://localhost:${port}
    API documentation in http://localhost:${port}/docs
    `);

  console.timeEnd('server-started');
}
bootstrap();
