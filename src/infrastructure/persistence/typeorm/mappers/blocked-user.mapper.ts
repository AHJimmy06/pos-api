import { BlockedUser } from '../../../../domain/entities/blocked-user.entity';

export interface RawBlockedUserRow {
  id: number;
  userId: number;
  failedAttempts: number;
  blockedAt?: Date;
}

export class BlockedUserMapper {
  static toEntity(raw: RawBlockedUserRow): BlockedUser {
    const entity = new BlockedUser(raw.userId);
    entity.id = raw.id;
    entity.failedAttempts = raw.failedAttempts;
    entity.blockedAt = raw.blockedAt || null;
    return entity;
  }

  static toPersistence(entity: BlockedUser): Record<string, unknown> {
    return {
      USER_ID: entity.userId,
      FAILED_ATTEMPTS: entity.failedAttempts,
      BLOCKED_AT: entity.blockedAt,
    };
  }
}
