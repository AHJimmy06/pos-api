import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto, RegisterUserDto } from '../../../application/dto';
import { LoginCommand } from '../../../application/auth/login.command';
import { RegisterUserCommand } from '../../../application/auth/register-user.command';
import { User } from '../../../domain/entities/user.entity';
import { JwtAuthGuard } from '../../../infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../../infrastructure/security/decorators/roles.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';

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
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
        dto.roles,
      ),
    );
    return { message: 'User created successfully', userId: user.id };
  }
}
