import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { LoginCommand } from '../commands/login.command';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IBlockedUserRepository } from '../../../domain/repositories/blocked-user.repository.interface';
import { PasswordService } from '../../../infrastructure/auth/services/password.service';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IBlockedUserRepository')
    private readonly blockedUserRepository: IBlockedUserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const { email, password } = command;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Buscar blocked user - si no existe, no está bloqueado
    const blockedUser = await this.blockedUserRepository.findByUserId(user.id);

    if (blockedUser?.isBlocked()) {
      throw new BadRequestException(
        'Account is blocked due to multiple failed login attempts',
      );
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      // Crear o actualizar blocked user usando upsert
      const updated = await this.blockedUserRepository.incrementFailedAttempts(
        user.id,
      );

      if (updated.isBlocked()) {
        throw new BadRequestException(
          'Account is now blocked due to multiple failed attempts',
        );
      }

      throw new UnauthorizedException('Invalid credentials');
    }

    // Login exitoso - resetear intentos fallidos si existían
    if (blockedUser && blockedUser.failedAttempts > 0) {
      await this.blockedUserRepository.reset(user.id);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const expiresIn = 3600;
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, expiresIn };
  }
}
