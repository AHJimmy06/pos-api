import { Tax } from '../../../domain/entities/tax.entity';

export abstract class ITaxRepository {
  abstract findAll(): Promise<Tax[]>;
  abstract findById(id: number): Promise<Tax | null>;
  abstract create(tax: Tax): Promise<Tax>;
  abstract update(id: number, tax: Partial<Tax>): Promise<Tax>;
  abstract delete(id: number): Promise<void>;
}
