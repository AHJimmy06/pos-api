import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { UserRole } from '../../domain/enums/user-role.enum';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { Inject } from '@nestjs/common';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(
    @Inject('IRoleRepository')
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
