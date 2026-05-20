import { BlockedUser } from '../entities/blocked-user.entity';

export abstract class IBlockedUserRepository {
  abstract findByUserId(userId: number): Promise<BlockedUser | null>;
  abstract create(blockedUser: BlockedUser): Promise<BlockedUser>;
  abstract incrementFailedAttempts(userId: number): Promise<BlockedUser>;
  abstract reset(userId: number): Promise<void>;
  abstract upsert(userId: number): Promise<BlockedUser>;
}