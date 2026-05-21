import { Client } from '../../../domain/entities/client.entity';

export class UpdateClientCommand {
  constructor(
    public readonly id: number,
    public readonly clientData: Partial<Client>,
  ) {}
}
