import { Role } from '../entities/role.entity';
import { UserRole } from '../enums/user-role.enum';

export abstract class IRoleRepository {
  abstract findByName(name: UserRole): Promise<Role | null>;
  abstract findByNames(names: UserRole[]): Promise<Role[]>;
  abstract findAll(): Promise<Role[]>;
}