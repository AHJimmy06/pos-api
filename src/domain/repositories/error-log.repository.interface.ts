import { ErrorLog } from '../entities/error-log.entity';

export abstract class IErrorLogRepository {
  abstract create(errorLog: ErrorLog): Promise<ErrorLog>;
}
