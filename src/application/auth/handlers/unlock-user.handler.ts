import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UnlockUserCommand } from '../commands/unlock-user.command';
import { IBlockedUserRepository } from '../../../domain/repositories/blocked-user.repository.interface';

@CommandHandler(UnlockUserCommand)
export class UnlockUserHandler implements ICommandHandler<UnlockUserCommand> {
  constructor(
    @Inject('IBlockedUserRepository')
    private readonly blockedUserRepository: IBlockedUserRepository,
  ) {}

  async execute(command: UnlockUserCommand): Promise<void> {
    const { userId } = command;

    const blockedUser = await this.blockedUserRepository.findByUserId(userId);
    if (!blockedUser) {
      throw new NotFoundException('User is not blocked');
    }

    await this.blockedUserRepository.reset(userId);
  }
}