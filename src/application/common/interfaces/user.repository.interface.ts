import { User } from '../../../domain/entities/user.entity';

export abstract class IUserRepository {
  abstract findAll(): Promise<User[]>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: User[]; total: number }>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract create(user: User, roleNames: string[]): Promise<User>;
  abstract update(id: number, data: Partial<User>): Promise<User>;
  abstract updateRoles(id: number, roleIds: number[]): Promise<User>;
  abstract softDelete(id: number): Promise<void>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract existsByUsername(username: string): Promise<boolean>;
}
