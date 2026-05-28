import { ErrorLog } from '../../../../domain/entities/error-log.entity';

export interface RawErrorLogRow {
  id: number;
  message: string;
  stackTrace?: string;
  exceptionType?: string;
  userId?: number;
  path: string;
  createdAt: Date;
}

export class ErrorLogMapper {
  static toEntity(raw: RawErrorLogRow): ErrorLog {
    const entity = new ErrorLog({
      message: raw.message,
      path: raw.path,
      stackTrace: raw.stackTrace,
      exceptionType: raw.exceptionType,
      userId: raw.userId,
    });
    entity.id = raw.id;
    entity.createdAt = raw.createdAt;
    return entity;
  }

  static toPersistence(entity: ErrorLog): Record<string, unknown> {
    return {
      MESSAGE: entity.message,
      STACK_TRACE: entity.stackTrace,
      EXCEPTION_TYPE: entity.exceptionType,
      USER_ID: entity.userId,
      PATH: entity.path,
    };
  }
}
