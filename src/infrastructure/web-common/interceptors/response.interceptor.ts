import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response as ExpressResponse } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    const request = ctx.getRequest<Request>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: T) => {
        // Use class-transformer to serialize entities with @Expose decorators
        const serializedData = instanceToPlain(data, {
          excludeExtraneousValues: false,
          enableImplicitConversion: true,
        }) as T;

        return {
          success: true,
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          data: serializedData,
        };
      }),
    );
  }
}
