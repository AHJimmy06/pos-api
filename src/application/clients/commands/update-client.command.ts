import { Client } from '../../../domain/clients/entities/client.entity';

export class UpdateClientCommand {
  constructor(
    public readonly id: number,
    public readonly clientData: Partial<Client>,
  ) {}
}
