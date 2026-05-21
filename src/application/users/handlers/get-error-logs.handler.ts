import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetErrorLogsQuery } from '../queries/get-error-logs.query';
import { Inject } from '@nestjs/common';
import { IErrorLogRepository } from '../../../domain/repositories/error-log.repository.interface';
import { ErrorLog } from '../../../domain/entities/error-log.entity';

@QueryHandler(GetErrorLogsQuery)
export class GetErrorLogsHandler implements IQueryHandler<GetErrorLogsQuery> {
  constructor(
    @Inject('IErrorLogRepository')
    private readonly errorLogRepository: IErrorLogRepository,
  ) {}

  async execute(
    query: GetErrorLogsQuery,
  ): Promise<{ data: ErrorLog[]; total: number }> {
    return this.errorLogRepository.findAllPaginated(query.page, query.limit);
  }
}
