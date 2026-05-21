import {
  Controller,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UnlockUserCommand } from '../../../application/auth/commands/unlock-user.command';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
