import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../web/controllers/auth.controller';
import { RolesController } from '../web/controllers/roles.controller';
import { PasswordService } from '../../infrastructure/security/services/password.service';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { JwtStrategy } from '../../infrastructure/security/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { LoginHandler } from '../../application/auth/login.handler';
import { RegisterUserHandler } from '../../application/auth/register-user.handler';
import { UnlockUserHandler } from '../../application/auth/unlock-user.handler';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma/repositories/user.repository';
import { PrismaRoleRepository } from '../../infrastructure/persistence/prisma/repositories/role.repository';
import { PrismaBlockedUserRepository } from '../../infrastructure/persistence/prisma/repositories/blocked-user.repository';
import { TOKENS } from '../../application/common/tokens/tokens';

const AuthHandlers = [LoginHandler, RegisterUserHandler, UnlockUserHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: 3600 },
    }),
    PrismaModule,
  ],
  controllers: [AuthController, RolesController],
  providers: [
    ...AuthHandlers,
    PasswordService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: TOKENS.ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
    {
      provide: TOKENS.BLOCKED_USER_REPOSITORY,
      useClass: PrismaBlockedUserRepository,
    },
    {
      provide: TOKENS.PASSWORD_SERVICE,
      useExisting: PasswordService,
    },
  ],
  exports: [
    TOKENS.PASSWORD_SERVICE,
    JwtModule,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    TOKENS.USER_REPOSITORY,
    TOKENS.ROLE_REPOSITORY,
    TOKENS.BLOCKED_USER_REPOSITORY,
  ],
})
export class AuthModule {}
