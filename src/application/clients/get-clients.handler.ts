import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClientsQuery } from './get-clients.query';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../common/interfaces/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetClientsQuery)
export class GetClientsHandler implements IQueryHandler<GetClientsQuery> {
  constructor(
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(
    query: GetClientsQuery,
  ): Promise<{ data: Client[]; total: number }> {
    return this.clientRepository.findAllPaginated(
      query.page,
      query.limit,
      query.search,
    );
  }
}
