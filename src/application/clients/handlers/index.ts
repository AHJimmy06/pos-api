import { CreateClientHandler } from './create-client.handler';
import { UpdateClientHandler } from './update-client.handler';
import { DeleteClientHandler } from './delete-client.handler';
import { GetClientsHandler } from './get-clients.handler';
import { GetClientHandler } from './get-client.handler';

export const ClientHandlers = [
  CreateClientHandler,
  UpdateClientHandler,
  DeleteClientHandler,
  GetClientsHandler,
  GetClientHandler,
];
