import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClientCommand } from '../commands/create-client.command';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../../../domain/clients/repositories/client.repository.interface';
import { Client } from '../../../domain/clients/entities/client.entity';

@CommandHandler(CreateClientCommand)
export class CreateClientHandler implements ICommandHandler<CreateClientCommand> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: CreateClientCommand): Promise<Client> {
    const { firstName, lastName, phone, address, email } = command;
    const client = new Client();
    client.firstName = firstName;
    client.lastName = lastName;
    client.phone = phone;
    client.address = address;
    client.email = email;

    return this.clientRepository.create(client);
  }
}
