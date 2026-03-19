import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupMiddleware } from './config/middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3001;
  const nodeEnv = config.get<string>('NODE_ENV') || 'development';
  const apiPrefix = config.get<string>('API_PREFIX') || 'api/v1';

  await setupMiddleware(app);

  await app.listen(port);

  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${nodeEnv}`);
  console.log(`API URL: http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
