import { Client } from '../entities/client.entity';

export abstract class IClientRepository {
  abstract findAll(): Promise<Client[]>;
  abstract findById(id: number): Promise<Client | null>;
  abstract create(client: Client): Promise<Client>;
  abstract update(id: number, client: Partial<Client>): Promise<Client>;
  abstract delete(id: number): Promise<void>;
}
