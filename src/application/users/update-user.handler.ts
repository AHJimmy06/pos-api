import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { id, ...data } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.existsByEmail(data.email);
      if (emailExists) {
        throw new ConflictException('Email already registered');
      }
    }

    return this.userRepository.update(id, data);
  }
}
