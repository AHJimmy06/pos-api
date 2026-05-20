import { User } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract findAll(): Promise<User[]>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract create(user: User, roleNames: string[]): Promise<User>;
  abstract update(id: number, data: Partial<User>): Promise<User>;
  abstract softDelete(id: number): Promise<void>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract existsByUsername(username: string): Promise<boolean>;
}