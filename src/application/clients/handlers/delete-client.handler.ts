import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteClientCommand } from '../commands/delete-client.command';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../../../domain/repositories/client.repository.interface';
import { DeleteResult } from '../../../domain/common/delete-result.interface';

@CommandHandler(DeleteClientCommand)
export class DeleteClientHandler implements ICommandHandler<DeleteClientCommand> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: DeleteClientCommand): Promise<DeleteResult> {
    const { id } = command;
    return this.clientRepository.delete(id);
  }
}
