import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupMiddleware } from './config/middleware';
import { log } from './config/logger';
import connectDB from './config/database';

async function bootstrap() {
  // Log server startup
  log.info('Starting JSGram Server', {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
  });

  try {
    // Connect to MongoDB
    await connectDB();
    log.info('Database connection established');
  } catch (error) {
    log.error('Failed to connect to database', error);
    process.exit(1);
  }
  
  const app = await NestFactory.create(AppModule);
  
  // Setup all middleware
  await setupMiddleware(app);
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  log.info('Server started successfully', {
    port,
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    timestamp: new Date().toISOString(),
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection', new Error(String(reason)));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

bootstrap();
