import { Client } from '../entities/client.entity';
import { DeleteResult } from '../common/delete-result.interface';

export abstract class IClientRepository {
  abstract findAll(): Promise<Client[]>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    searchField?: string,
  ): Promise<{ data: Client[]; total: number }>;
  abstract findById(id: number): Promise<Client | null>;
  abstract create(client: Client): Promise<Client>;
  abstract update(id: number, client: Partial<Client>): Promise<Client>;
  abstract delete(id: number): Promise<DeleteResult>;
}
