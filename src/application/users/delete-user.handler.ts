import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from './delete-user.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    await this.userRepository.softDelete(command.id);
  }
}
