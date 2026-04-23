import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './infrastructure/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './infrastructure/common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('POS API')
    .setDescription('API de Facturación con Clean Architecture y CQRS')
    .setVersion('1.0')
    .addTag('clients')
    .addTag('products')
    .addTag('taxes')
    .addTag('invoices')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Aplicación corriendo en: ${await app.getUrl()}`);
  console.log(`Swagger disponible en: ${await app.getUrl()}/docs`);
}
bootstrap().catch((err) => {
  console.error('Error starting application:', err);
});
