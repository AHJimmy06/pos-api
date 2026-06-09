import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClientCommand } from './create-client.command';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../common/interfaces/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(CreateClientCommand)
export class CreateClientHandler implements ICommandHandler<CreateClientCommand> {
  constructor(
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: CreateClientCommand): Promise<Client> {
    const { firstName, lastName, phone, address, email, cedula } = command;
    const client = new Client(firstName, lastName, email);
    client.phone = phone;
    client.address = address;
    client.cedula = cedula ?? null;

    return this.clientRepository.create(client);
  }
}
