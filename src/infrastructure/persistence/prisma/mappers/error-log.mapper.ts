import { ErrorLog as ErrorLogEntity } from '../../../../domain/entities/error-log.entity';
import { ErrorLog as PrismaErrorLog } from '@prisma/client';

export class ErrorLogMapper {
  static toEntity(prismaErrorLog: PrismaErrorLog): ErrorLogEntity {
    const entity = new ErrorLogEntity({
      message: prismaErrorLog.message,
      path: prismaErrorLog.path,
      stackTrace: prismaErrorLog.stackTrace || undefined,
      exceptionType: prismaErrorLog.exceptionType || undefined,
      userId: prismaErrorLog.userId || undefined,
      source: prismaErrorLog.source || undefined,
    });
    entity.id = prismaErrorLog.id;
    entity.createdAt = prismaErrorLog.createdAt;
    return entity;
  }

  static toPersistence(entity: ErrorLogEntity) {
    return {
      message: entity.message,
      stackTrace: entity.stackTrace,
      exceptionType: entity.exceptionType,
      userId: entity.userId,
      path: entity.path,
      source: entity.source,
      createdAt: entity.createdAt,
    };
  }
}
