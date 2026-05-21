import { Role } from '../entities/role.entity';
import { UserRole } from '../enums/user-role.enum';

export abstract class IRoleRepository {
  abstract findById(id: number): Promise<Role | null>;
  abstract findByName(name: UserRole): Promise<Role | null>;
  abstract findByNames(names: UserRole[]): Promise<Role[]>;
  abstract findByIds(ids: number[]): Promise<Role[]>;
  abstract findAll(): Promise<Role[]>;
}
