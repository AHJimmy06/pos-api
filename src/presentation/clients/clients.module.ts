import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsController } from '../controllers/clients.controller';
import { ClientHandlers } from '../../application/clients/handlers';
import { PrismaClientRepository } from '../../infrastructure/persistence/prisma/repositories/client.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [ClientsController],
  providers: [
    ...ClientHandlers,
    {
      provide: 'IClientRepository',
      useClass: PrismaClientRepository,
    },
  ],
  exports: ['IClientRepository'],
})
export class ClientsModule {}
