import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response as ExpressResponse } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain, plainToClass } from 'class-transformer';

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
        const serializedData = this.serializeData(data);

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

  private serializeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.serializeItem(item));
    }

    return this.serializeItem(data);
  }

  private serializeItem(item: any): any {
    // If item has toJSON method, use it (entities define their own serialization)
    if (item && typeof item.toJSON === 'function') {
      return item.toJSON();
    }

    // If it's a class instance with class-transformer decorators, use instanceToPlain
    if (
      item &&
      typeof item === 'object' &&
      item.constructor &&
      item.constructor.name !== 'Object'
    ) {
      try {
        return instanceToPlain(item, {
          excludeExtraneousValues: false,
          enableImplicitConversion: true,
        });
      } catch {
        // Fallback to manual serialization
      }
    }

    // For plain objects, serialize recursively
    if (item && typeof item === 'object') {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(item)) {
        result[key] = this.serializeData(item[key]);
      }
      return result;
    }

    return item;
  }
}
