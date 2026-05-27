import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UnlockUserCommand } from './unlock-user.command';
import { IBlockedUserRepository } from '../common/interfaces/blocked-user.repository.interface';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(UnlockUserCommand)
export class UnlockUserHandler implements ICommandHandler<UnlockUserCommand> {
  constructor(
    @Inject(TOKENS.BLOCKED_USER_REPOSITORY)
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
