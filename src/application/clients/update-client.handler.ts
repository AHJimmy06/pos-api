import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClientCommand } from './update-client.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../common/interfaces/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(UpdateClientCommand)
export class UpdateClientHandler implements ICommandHandler<UpdateClientCommand> {
  constructor(
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: UpdateClientCommand): Promise<Client> {
    const { id, clientData } = command;
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Rehidratamos la entidad
    const clientEntity = new Client(
      client.firstName,
      client.lastName,
      client.email,
    );
    clientEntity.id = client.id;
    clientEntity.phone = client.phone;
    clientEntity.address = client.address;

    if (clientData.firstName || clientData.lastName) {
      clientEntity.updateName(
        clientData.firstName ?? clientEntity.firstName,
        clientData.lastName ?? clientEntity.lastName,
      );
    }

    if (clientData.email) {
      clientEntity.updateEmail(clientData.email);
    }

    if (clientData.phone) clientEntity.phone = clientData.phone;
    if (clientData.address) clientEntity.address = clientData.address;

    return this.clientRepository.update(id, clientEntity);
  }
}
