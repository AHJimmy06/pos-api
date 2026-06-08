import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../../infrastructure/security/decorators/roles.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { User } from '../../../domain/entities/user.entity';
import { Role } from '../../../domain/entities/role.entity';
import { ErrorLog } from '../../../domain/entities/error-log.entity';
import { UnlockUserCommand } from '../../../application/auth/unlock-user.command';
import { GetUsersQuery } from '../../../application/users/get-users.query';
import { GetUserQuery } from '../../../application/users/get-user.query';
import { UpdateUserCommand } from '../../../application/users/update-user.command';
import { DeleteUserCommand } from '../../../application/users/delete-user.command';
import { GetRolesQuery } from '../../../application/users/get-roles.query';
import { GetErrorLogsQuery } from '../../../application/users/get-error-logs.query';
import { UpdateUserDto, AssignRolesDto } from '../../../application/dto';
import { AssignRolesCommand } from '../../../application/users/assign-roles.command';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<{ data: User[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.queryBus.execute(new GetUsersQuery(pageNum, limitNum, search));
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get('roles/all')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get all available roles (admin only)' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findAllRoles(): Promise<Role[]> {
    return this.queryBus.execute(new GetRolesQuery());
  }

  @Get('logs/errors')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get system error logs (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of error logs' })
  async findAllErrorLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: ErrorLog[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.queryBus.execute(new GetErrorLogsQuery(pageNum, limitNum));
  }

  @Put(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update user (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.commandBus.execute(
      new UpdateUserCommand(
        id,
        dto.username,
        dto.name,
        dto.lastName,
        dto.email,
        dto.cedula,
        dto.isActive,
      ),
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Delete (soft) user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new DeleteUserCommand(id));
    return { message: 'User deleted successfully' };
  }

  @Post(':id/unlock')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Unlock blocked user (admin only)' })
  @ApiResponse({ status: 200, description: 'User unlocked' })
  async unlock(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new UnlockUserCommand(id));
    return { message: 'User unlocked successfully' };
  }

  @Get(':id/roles')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get user roles (admin only)' })
  @ApiResponse({ status: 200, description: 'User roles' })
  async getUserRoles(@Param('id', ParseIntPipe) id: number): Promise<Role[]> {
    const user: any = await this.queryBus.execute(new GetUserQuery(id));

    return user.roles as Role[];
  }

  @Put(':id/roles')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Assign roles to user (admin only)' })
  @ApiResponse({ status: 200, description: 'Roles assigned' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
    @Req() req: Request & { user?: { id: number } },
  ): Promise<User> {
    return this.commandBus.execute(
      new AssignRolesCommand(id, dto.roleIds, req.user?.id),
    );
  }
}
