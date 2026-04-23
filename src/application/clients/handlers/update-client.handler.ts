import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClientCommand } from '../commands/update-client.command';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../../../domain/clients/repositories/client.repository.interface';
import { Client } from '../../../domain/clients/entities/client.entity';

@CommandHandler(UpdateClientCommand)
export class UpdateClientHandler implements ICommandHandler<UpdateClientCommand> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: UpdateClientCommand): Promise<Client> {
    const { id, clientData } = command;
    return this.clientRepository.update(id, clientData);
  }
}
