import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardStatsQuery } from '../../application/dashboard/dashboard-stats.query';
import { DashboardStatsHandler } from '../../application/dashboard/dashboard-stats.handler';
import { JwtAuthGuard } from '../../infrastructure/security/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';

type DashboardStats =
  ReturnType<DashboardStatsHandler['execute']> extends Promise<infer T>
    ? T
    : never;

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('stats')
  @Roles(UserRole.ADMINISTRATOR, UserRole.SELLER)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(): Promise<DashboardStats> {
    return this.queryBus.execute(new DashboardStatsQuery());
  }
}
