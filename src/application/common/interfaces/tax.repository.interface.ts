import { Tax } from '../../../domain/entities/tax.entity';

export abstract class ITaxRepository {
  abstract findAll(): Promise<Tax[]>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    searchField?: string,
  ): Promise<{ data: Tax[]; total: number }>;
  abstract findById(id: number): Promise<Tax | null>;
  abstract findByIds(ids: number[]): Promise<Tax[]>;
  abstract create(tax: Tax): Promise<Tax>;
  abstract update(id: number, tax: Partial<Tax>): Promise<Tax>;
  abstract delete(id: number): Promise<void>;
}
