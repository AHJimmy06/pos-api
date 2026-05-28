import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DashboardController } from './dashboard.controller';
import { DashboardStatsHandler } from '../../application/dashboard/dashboard-stats.handler';

const CommandHandlers = [];
const QueryHandlers = [DashboardStatsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [DashboardController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class DashboardModule {}
