import { Injectable, Inject } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';
import { IUnitOfWork } from '../../../application/common/interfaces/unit-of-work.interface';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  private readonly asyncLocalStorage = new AsyncLocalStorage<EntityManager>();

  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      return this.asyncLocalStorage.run(manager, work);
    });
  }

  getManager(): EntityManager {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      return store;
    }
    return this.dataSource.createEntityManager();
  }
}
