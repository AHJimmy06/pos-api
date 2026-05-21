import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto } from '../dto/login.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginCommand } from '../../../application/auth/commands/login.command';
import { RegisterUserCommand } from '../../../application/auth/commands/register-user.command';
import { User } from '../../../domain/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Account blocked' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    return this.commandBus.execute(
      new LoginCommand(loginDto.email, loginDto.password),
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<{ message: string; userId: number }> {
    const user: User = await this.commandBus.execute(
      new RegisterUserCommand(
        dto.username,
        dto.name,
        dto.lastName,
        dto.email,
        dto.password,
        dto.cedula,
      ),
    );
    return { message: 'User created successfully', userId: user.id };
  }
}
