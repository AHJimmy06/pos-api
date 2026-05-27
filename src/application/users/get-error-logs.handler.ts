import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetErrorLogsQuery } from './get-error-logs.query';
import { Inject } from '@nestjs/common';
import { IErrorLogRepository } from '../common/interfaces/error-log.repository.interface';
import { ErrorLog } from '../../domain/entities/error-log.entity';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetErrorLogsQuery)
export class GetErrorLogsHandler implements IQueryHandler<GetErrorLogsQuery> {
  constructor(
    @Inject(TOKENS.ERROR_LOG_REPOSITORY)
    private readonly errorLogRepository: IErrorLogRepository,
  ) {}

  async execute(
    query: GetErrorLogsQuery,
  ): Promise<{ data: ErrorLog[]; total: number }> {
    return this.errorLogRepository.findAllPaginated(query.page, query.limit);
  }
}
