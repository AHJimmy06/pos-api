import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaClient } from '@prisma/client';
import { IUnitOfWork } from '../../../application/common/interfaces/unit-of-work.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUnitOfWork extends IUnitOfWork {
  private readonly asyncLocalStorage = new AsyncLocalStorage<PrismaClient>();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      return this.asyncLocalStorage.run(tx, work);
    });
  }

  getClient(): PrismaClient {
    const client = this.asyncLocalStorage.getStore();
    return client || this.prisma;
  }
}
