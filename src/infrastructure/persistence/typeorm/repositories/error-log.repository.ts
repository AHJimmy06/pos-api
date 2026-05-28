import { TOKENS } from '../../../../application/common/tokens/tokens';
import { Inject } from '@nestjs/common';
import { IErrorLogRepository } from '../../../../application/common/interfaces/error-log.repository.interface';
import { ErrorLog } from '../../../../domain/entities/error-log.entity';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { ErrorLogMapper } from '../mappers/error-log.mapper';

export class TypeOrmErrorLogRepository implements IErrorLogRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  async create(errorLog: ErrorLog): Promise<ErrorLog> {
    const result = await this.manager.query(
      `INSERT INTO ERROR_LOGS (MESSAGE, STACK_TRACE, EXCEPTION_TYPE, USER_ID, PATH)
       VALUES (:1, :2, :3, :4, :5)`,
      [
        errorLog.message,
        errorLog.stackTrace,
        errorLog.exceptionType,
        errorLog.userId,
        errorLog.path,
      ],
    );

    if (!result || !result.rowsAffected || result.rowsAffected === 0) {
      throw new Error('Failed to create error log');
    }

    // For Oracle, retrieve the created error log
    const insertedRow = await this.manager.query(
      `SELECT ID, MESSAGE, STACK_TRACE, EXCEPTION_TYPE, USER_ID, PATH, CREATED_AT
       FROM ERROR_LOGS
       WHERE ROWNUM = 1
       ORDER BY CREATED_AT DESC`,
    );

    if (insertedRow.length === 0) {
      throw new Error('Failed to retrieve created error log');
    }

    const row = insertedRow[0];
    return ErrorLogMapper.toEntity({
      id: row.ID as number,
      message: row.ERROR_CODE as string,
      stackTrace: row.MESSAGE as string | undefined,
      exceptionType: row.STACK as string | undefined,
      userId: row.CONTEXT as number | undefined,
      path: row.USER_ID as string,
      createdAt: row.CREATED_AT as Date,
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: ErrorLog[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await this.manager.query(
      `SELECT COUNT(*) as CNT FROM ERROR_LOGS`,
    );
    const total = parseInt(countResult[0]?.CNT || '0', 10);

    const rows = await this.manager.query(
      `SELECT ID, MESSAGE, STACK_TRACE, EXCEPTION_TYPE, USER_ID, PATH, CREATED_AT
       FROM ERROR_LOGS
       ORDER BY CREATED_AT DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      [offset, limit],
    );

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      data: rows.map((row) =>
        ErrorLogMapper.toEntity({
          id: row.ID as number,
          message: row.ERROR_CODE as string,
          stackTrace: row.MESSAGE as string | undefined,
          exceptionType: row.STACK as string | undefined,
          userId: row.CONTEXT as number | undefined,
          path: row.USER_ID as string,
          createdAt: row.CREATED_AT as Date,
        }),
      ),
      total,
    };
  }
}
