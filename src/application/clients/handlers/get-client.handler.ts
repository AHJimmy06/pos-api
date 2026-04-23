import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClientQuery } from '../queries/get-client.query';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../../../domain/clients/repositories/client.repository.interface';
import { Client } from '../../../domain/clients/entities/client.entity';

@QueryHandler(GetClientQuery)
export class GetClientHandler implements IQueryHandler<GetClientQuery> {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(query: GetClientQuery): Promise<Client | null> {
    return this.clientRepository.findById(query.id);
  }
}
