import { TOKENS } from '../../../../application/common/tokens/tokens';
import { Inject } from '@nestjs/common';
import { IBlockedUserRepository } from '../../../../application/common/interfaces/blocked-user.repository.interface';
import { BlockedUser } from '../../../../domain/entities/blocked-user.entity';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { BlockedUserMapper } from '../mappers/blocked-user.mapper';

export class TypeOrmBlockedUserRepository implements IBlockedUserRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  async findByUserId(userId: number): Promise<BlockedUser | null> {
    const rows = await this.manager.query(
      `SELECT ID, USER_ID, FAILED_ATTEMPTS, BLOCKED_AT
       FROM BLOCKED_USERS
       WHERE USER_ID = :1`,
      [userId],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return BlockedUserMapper.toEntity({
      id: row.ID as number,
      userId: row.USER_ID as number,
      failedAttempts: row.FAILED_ATTEMPTS as number,
      blockedAt: row.LAST_FAILED_ATTEMPT as Date | undefined,
    });
  }

  async create(blockedUser: BlockedUser): Promise<BlockedUser> {
    const result = await this.manager.query(
      `INSERT INTO BLOCKED_USERS (USER_ID, FAILED_ATTEMPTS, BLOCKED_AT)
       VALUES (:1, :2, :3)`,
      [blockedUser.userId, blockedUser.failedAttempts, blockedUser.blockedAt],
    );

    if (!result || !result.rowsAffected || result.rowsAffected === 0) {
      throw new Error('Failed to create blocked user');
    }

    const insertedRow = await this.findByUserId(blockedUser.userId);
    if (!insertedRow) {
      throw new Error('Failed to retrieve created blocked user');
    }
    return insertedRow;
  }

  async incrementFailedAttempts(userId: number): Promise<BlockedUser> {
    await this.manager.query(
      `UPDATE BLOCKED_USERS
       SET FAILED_ATTEMPTS = FAILED_ATTEMPTS + 1,
           BLOCKED_AT = CASE WHEN FAILED_ATTEMPTS + 1 >= 3 THEN SYSTIMESTAMP ELSE BLOCKED_AT END
       WHERE USER_ID = :1`,
      [userId],
    );

    const result = await this.findByUserId(userId);
    if (!result) {
      throw new Error('Blocked user not found after increment');
    }
    return result;
  }

  async reset(userId: number): Promise<void> {
    await this.manager.query(
      `UPDATE BLOCKED_USERS
       SET FAILED_ATTEMPTS = 0, BLOCKED_AT = NULL
       WHERE USER_ID = :1`,
      [userId],
    );
  }

  async upsert(userId: number): Promise<BlockedUser> {
    // Oracle MERGE pattern
    await this.manager.query(
      `MERGE INTO BLOCKED_USERS dst
       USING (SELECT :1 AS USER_ID, 1 AS FAILED_ATTEMPTS FROM DUAL) src
       ON (dst.USER_ID = src.USER_ID)
       WHEN MATCHED THEN
         UPDATE SET dst.FAILED_ATTEMPTS = dst.FAILED_ATTEMPTS + 1,
                    dst.BLOCKED_AT = CASE WHEN dst.FAILED_ATTEMPTS + 1 >= 3 THEN SYSTIMESTAMP ELSE dst.BLOCKED_AT END
       WHEN NOT MATCHED THEN
         INSERT (USER_ID, FAILED_ATTEMPTS, BLOCKED_AT)
         VALUES (src.USER_ID, src.FAILED_ATTEMPTS, NULL)`,
      [userId],
    );

    const result = await this.findByUserId(userId);
    if (!result) {
      throw new Error('Failed to upsert blocked user');
    }
    return result;
  }
}
