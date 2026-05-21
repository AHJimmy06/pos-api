import { ErrorLog } from '../entities/error-log.entity';

export abstract class IErrorLogRepository {
  abstract create(errorLog: ErrorLog): Promise<ErrorLog>;
  abstract findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: ErrorLog[]; total: number }>;
}
