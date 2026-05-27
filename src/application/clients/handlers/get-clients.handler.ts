import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClientsQuery } from '../queries/get-clients.query';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../../../domain/repositories/client.repository.interface';
import { Client } from '../../../domain/entities/client.entity';

@QueryHandler(GetClientsQuery)
export class GetClientsHandler implements IQueryHandler<GetClientsQuery> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(
    query: GetClientsQuery,
  ): Promise<{ data: Client[]; total: number }> {
    return this.clientRepository.findAllPaginated(
      query.page,
      query.limit,
      query.search,
      query.searchField,
    );
  }
}
