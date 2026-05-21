import { Injectable } from '@nestjs/common';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';
import { IErrorLogRepository } from '../../../../domain/repositories/error-log.repository.interface';
import { ErrorLog as ErrorLogEntity } from '../../../../domain/entities/error-log.entity';
import { ErrorLogMapper } from '../mappers/error-log.mapper';

@Injectable()
export class PrismaErrorLogRepository extends IErrorLogRepository {
  constructor(private readonly uow: PrismaUnitOfWork) {
    super();
  }

  private get prisma() {
    return this.uow.getClient();
  }

  async create(errorLog: ErrorLogEntity): Promise<ErrorLogEntity> {
    const data = ErrorLogMapper.toPersistence(errorLog);
    const created = await this.prisma.errorLog.create({ data });
    return ErrorLogMapper.toEntity(created);
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: ErrorLogEntity[]; total: number }> {
    const [logs, total] = await Promise.all([
      this.prisma.errorLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.errorLog.count(),
    ]);

    return {
      data: logs.map((l) => ErrorLogMapper.toEntity(l)),
      total,
    };
  }
}
