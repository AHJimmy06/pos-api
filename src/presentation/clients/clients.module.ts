import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsController } from '../web/controllers/clients.controller';
import { CreateClientHandler } from '../../application/clients/create-client.handler';
import { DeleteClientHandler } from '../../application/clients/delete-client.handler';
import { GetClientHandler } from '../../application/clients/get-client.handler';
import { GetClientsHandler } from '../../application/clients/get-clients.handler';
import { UpdateClientHandler } from '../../application/clients/update-client.handler';
import { TypeOrmClientRepository } from '../../infrastructure/persistence/typeorm/repositories/client.repository';
import { TypeOrmModule } from '../../infrastructure/persistence/typeorm/typeorm-module';
import { TOKENS } from '../../application/common/tokens/tokens';

const ClientHandlers = [
  CreateClientHandler,
  DeleteClientHandler,
  GetClientHandler,
  GetClientsHandler,
  UpdateClientHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule],
  controllers: [ClientsController],
  providers: [
    ...ClientHandlers,
    {
      provide: TOKENS.CLIENT_REPOSITORY,
      useClass: TypeOrmClientRepository,
    },
  ],
  exports: [TOKENS.CLIENT_REPOSITORY],
})
export class ClientsModule {}
