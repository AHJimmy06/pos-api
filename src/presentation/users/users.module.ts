import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from '../web/controllers/users.controller';
import { AuthModule } from '../auth/auth.module';
import { GetUsersHandler } from '../../application/users/get-users.handler';
import { GetUserHandler } from '../../application/users/get-user.handler';
import { UpdateUserHandler } from '../../application/users/update-user.handler';
import { DeleteUserHandler } from '../../application/users/delete-user.handler';
import { GetErrorLogsHandler } from '../../application/users/get-error-logs.handler';
import { AssignRolesHandler } from '../../application/users/assign-roles.handler';
import { TypeOrmModule } from '../../infrastructure/persistence/typeorm/typeorm-module';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/typeorm/repositories/user.repository';
import { TypeOrmRoleRepository } from '../../infrastructure/persistence/typeorm/repositories/role.repository';
import { TOKENS } from '../../application/common/tokens/tokens';

const UserHandlers = [
  GetUsersHandler,
  GetUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  GetErrorLogsHandler,
  AssignRolesHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: 3600 },
    }),
    AuthModule,
    TypeOrmModule,
  ],
  controllers: [UsersController],
  providers: [
    ...UserHandlers,
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: TOKENS.ROLE_REPOSITORY,
      useClass: TypeOrmRoleRepository,
    },
  ],
})
export class UsersModule {}
