import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from './get-users.query';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetUsersQuery,
  ): Promise<{ data: User[]; total: number }> {
    return this.userRepository.findAllPaginated(
      query.page,
      query.limit,
      query.search,
    );
  }
}
