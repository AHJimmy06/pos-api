import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClientCommand } from '../commands/create-client.command';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../../../domain/repositories/client.repository.interface';
import { Client } from '../../../domain/entities/client.entity';

@CommandHandler(CreateClientCommand)
export class CreateClientHandler implements ICommandHandler<CreateClientCommand> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: CreateClientCommand): Promise<Client> {
    const { firstName, lastName, phone, address, email } = command;
    const client = new Client(firstName, lastName, email);
    client.phone = phone;
    client.address = address;

    return this.clientRepository.create(client);
  }
}
