import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClientQuery } from './get-client.query';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '../common/interfaces/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetClientQuery)
export class GetClientHandler implements IQueryHandler<GetClientQuery> {
  constructor(
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(query: GetClientQuery): Promise<Client | null> {
    return this.clientRepository.findById(query.id);
  }
}
