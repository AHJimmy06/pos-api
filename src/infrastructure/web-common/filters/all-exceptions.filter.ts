import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../../../domain/exceptions/business.exception';
import { IErrorLogRepository } from '../../../application/common/interfaces/error-log.repository.interface';
import { ErrorLog } from '../../../domain/entities/error-log.entity';
import { TOKENS } from '../../../application/common/tokens/tokens';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(TOKENS.ERROR_LOG_REPOSITORY)
    private readonly errorLogRepository: IErrorLogRepository,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof BusinessException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
    }

    const errorDetail =
      message instanceof Object ? JSON.stringify(message) : message;

    // Persist error asynchronously (Fire and Forget)
    const userId = (request as Request & { user?: { id: number } }).user?.id;

    this.errorLogRepository
      .create(
        new ErrorLog({
          message: errorDetail,
          path: request.url,
          stackTrace: exception instanceof Error ? exception.stack : undefined,
          exceptionType:
            exception instanceof Error ? exception.constructor.name : undefined,
          userId: userId,
          source: JSON.stringify({
            method: request.method,
            path: request.path,
            query: Object.keys(request.query).length > 0 ? request.query : undefined,
            ip: request.ip || request.socket?.remoteAddress,
          }),
        }),
      )

      .catch((err) => {
        console.error('Failed to save ErrorLog:', err);
      });

    console.error(`[${new Date().toISOString()}] Exception caught:`, exception);

    response.status(status).json({
      success: false,
      statusCode: status,
      code: code,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
