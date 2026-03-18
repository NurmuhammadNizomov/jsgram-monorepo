import pino from 'pino';

// Logger configuration based on environment
const loggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  // Production settings
  formatters: {
    level: (label: string) => ({ level: label }),
    log: (object: any) => ({
      ...object,
      timestamp: new Date().toISOString(),
    }),
  },
  // File logging for production
  ...(process.env.NODE_ENV === 'production' && {
    file: './logs/app.log',
  }),
};

// Create logger instance
export const logger = pino(loggerConfig);

// Development-friendly logger methods
export const log = {
  info: (message: string, meta?: any) => logger.info(meta || {}, message),
  error: (message: string, error?: Error | any) => {
    if (error instanceof Error) {
      logger.error({ 
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } 
      }, message);
    } else {
      logger.error(error || {}, message);
    }
  },
  warn: (message: string, meta?: any) => logger.warn(meta || {}, message),
  debug: (message: string, meta?: any) => logger.debug(meta || {}, message),
  // Request logging
  request: (req: any, message?: string) => {
    logger.info({
      method: req.method,
      url: req.url,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
    }, message || 'HTTP Request');
  },
  // Response logging
  response: (req: any, statusCode: number, duration?: number) => {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      userId: req.user?.id,
    }, 'HTTP Response');
  },
  // Database operations
  db: (operation: string, collection: string, duration?: number) => {
    logger.debug({
      operation,
      collection,
      duration: duration ? `${duration}ms` : undefined,
    }, 'Database Operation');
  },
  // Security events
  security: (event: string, details: any) => {
    logger.warn({
      event,
      ...details,
    }, `Security Event: ${event}`);
  },
  // Performance monitoring
  performance: (metric: string, value: number, unit?: string) => {
    logger.info({
      metric,
      value,
      unit,
    }, `Performance: ${metric}`);
  },
};

export default logger;
