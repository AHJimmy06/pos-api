import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { GetCurrentUserQuery } from './get-current-user.query';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetCurrentUserQuery) {
    const user = await this.userRepository.findById(query.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      cedula: user.cedula,
      isActive: user.isActive,
      roles: user.roles,
    };
  }
}
