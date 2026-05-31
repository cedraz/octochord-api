import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // sem logs de bootstrap no output
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

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = path.resolve(process.cwd(), 'swagger.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');

  console.log(`✅ swagger.json gerado em: ${outputPath}`);

  await app.close();
}

generateSwagger().catch((err) => {
  console.error('❌ Erro ao gerar swagger.json:', err);
  process.exit(1);
});
