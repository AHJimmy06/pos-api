import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../infrastructure/security/decorators/roles.decorator';
import { RolesGuard } from '../../../infrastructure/security/guards/roles.guard';
import { JwtAuthGuard } from '../../../infrastructure/security/guards/jwt-auth.guard';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IRoleRepository } from '../../../application/common/interfaces/role.repository.interface';
import { Inject } from '@nestjs/common';
import { TOKENS } from '../../../application/common/tokens/tokens';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(
    @Inject(TOKENS.ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get all available roles' })
  async findAll() {
    return this.roleRepository.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get a role by id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleRepository.findById(id);
  }
}
