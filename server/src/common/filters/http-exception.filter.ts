import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { log } from '../../config/logger';
import { getRequestLang, t, translateIfKey } from '../i18n/i18n';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly nestLogger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let errors: unknown | undefined;
    let code: string | undefined;
    let errorId: string | undefined;
    const lang = getRequestLang(request);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = 'Request failed';
      code = status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR';

      if (typeof exceptionResponse === 'string') {
        message = String(translateIfKey(lang, exceptionResponse));
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const er = exceptionResponse as any;

        if (Array.isArray(er.message)) {
          const translated = er.message.map((m: unknown) => translateIfKey(lang, m));
          errors = translated;
          const first = translated[0];
          message =
            (typeof first === 'string' && first) ||
            (typeof er.error === 'string' ? er.error : '') ||
            t(lang, 'common.validation_error');
          code = 'VALIDATION_ERROR';
        } else if (typeof er.message === 'string') {
          message = String(translateIfKey(lang, er.message));
        } else if (typeof er.error === 'string') {
          message = String(translateIfKey(lang, er.error));
        }
      }
      
      // Log HTTP exceptions with structured logging
      log.error('HTTP Exception', {
        status,
        message,
        url: request.url,
        method: request.method,
        userAgent: request.get('user-agent'),
        ip: request.ip,
      });

      // Never expose internal/server error details to the client
      if (status >= 500) {
        errorId = randomUUID();
        message = t(lang, 'common.internal_error');
        errors = undefined;

        log.error('Internal error response', {
          errorId,
          status,
          url: request.url,
          method: request.method,
        });
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = t(lang, 'common.internal_error');
      code = 'INTERNAL_SERVER_ERROR';
      errorId = randomUUID();
      
      // Log unexpected errors with full stack trace
      const error = exception instanceof Error ? exception : new Error(String(exception));
      log.error('Unhandled Exception', { errorId, error });
      
      // Also log with NestJS logger for compatibility
      this.nestLogger.error(
        `${request.method} ${request.url}`,
        error.stack,
      );
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      data: null,
      ...(code ? { code } : {}),
      ...(errorId ? { errorId } : {}),
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
      method: request.method,
    };
    response.status(status).json(errorResponse);
  }
}
