import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { log } from '../../config/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly nestLogger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string | object;
    let errorType: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exceptionResponse;
      errorType = exception.constructor.name;
      
      // Log HTTP exceptions with structured logging
      log.error('HTTP Exception', {
        status,
        errorType,
        message,
        url: request.url,
        method: request.method,
        userAgent: request.get('user-agent'),
        ip: request.ip,
      });
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorType = 'InternalServerError';
      
      // Log unexpected errors with full stack trace
      const error = exception instanceof Error ? exception : new Error(String(exception));
      log.error('Unhandled Exception', error);
      
      // Also log with NestJS logger for compatibility
      this.nestLogger.error(
        `${request.method} ${request.url}`,
        error.stack,
      );
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorType,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: exception instanceof Error ? exception.stack : undefined 
      }),
    };

    // Log response
    log.response(request, status);

    response.status(status).json(errorResponse);
  }
}
