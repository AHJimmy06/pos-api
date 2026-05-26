import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteClientCommand } from './delete-client.command';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../common/interfaces/client.repository.interface';
import { DeleteResult } from '../../domain/common/delete-result.interface';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(DeleteClientCommand)
export class DeleteClientHandler implements ICommandHandler<DeleteClientCommand> {
  constructor(
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: DeleteClientCommand): Promise<DeleteResult> {
    const { id } = command;
    return this.clientRepository.delete(id);
  }
}
