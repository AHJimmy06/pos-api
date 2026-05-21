import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IErrorLogRepository } from '../../../../domain/repositories/error-log.repository.interface';
import { ErrorLog as ErrorLogEntity } from '../../../../domain/entities/error-log.entity';
import { ErrorLogMapper } from '../mappers/error-log.mapper';

@Injectable()
export class PrismaErrorLogRepository extends IErrorLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(errorLog: ErrorLogEntity): Promise<ErrorLogEntity> {
    const data = ErrorLogMapper.toPersistence(errorLog);
    const created = await this.prisma.errorLog.create({ data });
    return ErrorLogMapper.toEntity(created);
  }
}
