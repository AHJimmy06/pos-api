import { Injectable } from '@nestjs/common';
import { IBlockedUserRepository } from '../../../../domain/repositories/blocked-user.repository.interface';
import { BlockedUser } from '../../../../domain/entities/blocked-user.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBlockedUserRepository implements IBlockedUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<BlockedUser | null> {
    const blocked = await this.prisma.blockedUser.findUnique({
      where: { userId },
    });
    return blocked ? this.mapToDomain(blocked) : null;
  }

  async create(blockedUser: BlockedUser): Promise<BlockedUser> {
    const created = await this.prisma.blockedUser.create({
      data: {
        userId: blockedUser.userId,
        failedAttempts: blockedUser.failedAttempts,
        blockedAt: blockedUser.blockedAt,
      },
    });
    return this.mapToDomain(created);
  }

  async incrementFailedAttempts(userId: number): Promise<BlockedUser> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      const created = await this.prisma.blockedUser.create({
        data: {
          userId,
          failedAttempts: 1,
          blockedAt: null,
        },
      });
      return this.mapToDomain(created);
    }

    const newAttempts = existing.failedAttempts + 1;
    const blockedAt = newAttempts >= 3 ? new Date() : null;

    const updated = await this.prisma.blockedUser.update({
      where: { userId },
      data: {
        failedAttempts: newAttempts,
        blockedAt,
      },
    });
    return this.mapToDomain(updated);
  }

  async reset(userId: number): Promise<void> {
    await this.prisma.blockedUser.update({
      where: { userId },
      data: { failedAttempts: 0, blockedAt: null },
    });
  }

  async upsert(userId: number): Promise<BlockedUser> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    return this.create(new BlockedUser(userId));
  }

  private mapToDomain(prismaBlocked: {
    id: number;
    userId: number;
    failedAttempts: number;
    blockedAt: Date | null;
  }): BlockedUser {
    const blocked = new BlockedUser(prismaBlocked.userId);
    (blocked as unknown as { id: number }).id = prismaBlocked.id;
    blocked.failedAttempts = prismaBlocked.failedAttempts;
    if (prismaBlocked.blockedAt) {
      blocked.blockedAt = prismaBlocked.blockedAt;
    }
    return blocked;
  }
}
