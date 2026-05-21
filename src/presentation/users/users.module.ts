import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './controllers/users.controller';
import { AuthModule } from '../auth/auth.module';
import { UnlockUserHandler } from '../../application/auth/handlers/unlock-user.handler';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma/repositories/user.repository';

const UserHandlers = [UnlockUserHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: 3600 },
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [UsersController],
  providers: [
    ...UserHandlers,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class UsersModule {}
