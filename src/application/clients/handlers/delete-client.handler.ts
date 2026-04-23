import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteClientCommand } from '../commands/delete-client.command';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../../../domain/clients/repositories/client.repository.interface';

@CommandHandler(DeleteClientCommand)
export class DeleteClientHandler implements ICommandHandler<DeleteClientCommand> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: DeleteClientCommand): Promise<void> {
    const { id } = command;
    await this.clientRepository.delete(id);
  }
}
