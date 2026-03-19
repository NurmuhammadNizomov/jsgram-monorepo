import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import type { Express, NextFunction, Request, Response } from 'express';
import { log } from './logger';
import { getRequestLang, t } from '../common/i18n/i18n';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  next();
};

export const setupMiddleware = async (app: INestApplication): Promise<void> => {
  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('NODE_ENV') || 'development';
  const apiPrefix = config.get<string>('API_PREFIX') || 'api/v1';
  const isProd = nodeEnv === 'production';

  app.use(requestLogger);
  app.use(cookieParser());

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  app.enableCors({
    origin: isProd ? ['https://yourdomain.com'] : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-lang', 'x-request-id'],
  });

  app.use(compression({ threshold: 1024 }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response, _next: NextFunction, options: { statusCode?: number }) => {
      const statusCode = options.statusCode ?? 429;
      res.status(statusCode).json({
        success: false,
        statusCode,
        message: t(getRequestLang(req), 'common.rate_limited'),
        data: null,
        code: 'RATE_LIMIT',
        timestamp: new Date().toISOString(),
        path: req.originalUrl ?? req.url,
        method: req.method,
      });
    },
    skip: (req: Request) => req.url === '/health' || req.url === '/api/health',
  }));

  app.setGlobalPrefix(apiPrefix);
  (app.getHttpAdapter().getInstance() as Express).set('trust proxy', 1);

  log.info('Middleware setup completed', { environment: nodeEnv, apiPrefix });
};
