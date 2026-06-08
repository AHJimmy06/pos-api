import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import type { IPasswordService } from '../common/interfaces/password-service.interface';
import { User } from '../../domain/entities/user.entity';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKENS.PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const { username, name, lastName, email, password, cedula, roles } =
      command;

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

    // Use provided roles or default to SELLER
    const userRoles = roles && roles.length > 0 ? roles : ['SELLER'];

    return this.userRepository.create(user, userRoles);
  }
}
