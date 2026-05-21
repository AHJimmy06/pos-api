import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterUserCommand } from '../commands/register-user.command';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { PasswordService } from '../../../infrastructure/auth/services/password.service';
import { User } from '../../../domain/entities/user.entity';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const { username, name, lastName, email, password, cedula } = command;

    const passwordValidation = this.passwordService.validateStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors.join('; '));
    }

    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    const usernameExists = await this.userRepository.existsByUsername(username);
    if (usernameExists) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await this.passwordService.hash(password);

    const user = new User(username, name, lastName, email, passwordHash);
    user.cedula = cedula ?? null;

    return this.userRepository.create(user, ['SELLER']);
  }
}
