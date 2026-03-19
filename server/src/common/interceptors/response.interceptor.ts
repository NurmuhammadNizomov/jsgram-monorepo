import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getRequestLang, t, translateIfKey } from '../i18n/i18n';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
  code?: string;
  errorId?: string;
  errors?: unknown;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const lang = getRequestLang(req);

        if (payload && typeof payload === 'object' && 'success' in payload && 'statusCode' in payload) {
          return payload;
        }

        let message = t(lang, 'common.ok');
        let data = payload;

        if (payload && typeof payload === 'object' && typeof payload.message === 'string') {
          message = String(translateIfKey(lang, payload.message));
          const { message: _message, ...rest } = payload;
          data = Object.keys(rest).length > 0 ? rest : null;
        }

        return {
          success: true,
          statusCode: res?.statusCode ?? 200,
          message,
          data,
          code: 'OK',
          timestamp: new Date().toISOString(),
          path: req?.originalUrl ?? req?.url ?? '',
          method: req?.method ?? '',
        };
      }),
    );
  }
}
