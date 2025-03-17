import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://front-transporte-dashboard.s3-website.us-east-2.amazonaws.com/', 'http//localhost:4200'], // Permite solicitudes desde Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Si necesitas enviar cookies o autenticación
  });

  await app.listen(3000);
  logger.log(`La aplicación está corriendo en: http://localhost:3000`);
}
bootstrap();