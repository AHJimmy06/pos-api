import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response as ExpressResponse } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
        const serializedData = this.serialize(data);

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

  private serialize(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    // If has toJSON, use it
    if (typeof value.toJSON === 'function') {
      return value.toJSON();
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item));
    }

    // Handle objects
    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(value)) {
        result[key] = this.serialize(value[key]);
      }
      return result;
    }

    return value;
  }
}
