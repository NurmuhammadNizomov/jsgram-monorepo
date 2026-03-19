export const log = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    console.debug(`[DEBUG] ${message}`, ...args);
  },
  request: (req: any) => {
    const method = req?.method;
    const url = req?.originalUrl ?? req?.url;
    const ip = req?.ip ?? req?.socket?.remoteAddress;
    const userAgent = typeof req?.get === 'function'
      ? req.get('user-agent')
      : req?.headers?.['user-agent'];
    const requestId = req?.headers?.['x-request-id'];

    console.log('[REQUEST]', {
      method,
      url,
      ip,
      userAgent,
      requestId,
    });
  },
  response: (req: any, statusCode: number, durationMs?: number) => {
    const method = req?.method;
    const url = req?.originalUrl ?? req?.url;
    const requestId = req?.headers?.['x-request-id'];

    console.log('[RESPONSE]', {
      method,
      url,
      statusCode,
      durationMs,
      requestId,
    });
  },
};
