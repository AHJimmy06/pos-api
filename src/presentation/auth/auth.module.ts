import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { RolesController } from '../controllers/roles.controller';
import { PasswordService } from '../../infrastructure/auth/services/password.service';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { LoginHandler } from '../../application/auth/handlers/login.handler';
import { RegisterUserHandler } from '../../application/auth/handlers/register-user.handler';
import { UnlockUserHandler } from '../../application/auth/handlers/unlock-user.handler';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma/repositories/user.repository';
import { PrismaRoleRepository } from '../../infrastructure/persistence/prisma/repositories/role.repository';
import { PrismaBlockedUserRepository } from '../../infrastructure/persistence/prisma/repositories/blocked-user.repository';

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
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: PrismaRoleRepository,
    },
    {
      provide: 'IBlockedUserRepository',
      useClass: PrismaBlockedUserRepository,
    },
  ],
  exports: [
    PasswordService,
    JwtModule,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    'IUserRepository',
    'IRoleRepository',
    'IBlockedUserRepository',
  ],
})
export class AuthModule {}
