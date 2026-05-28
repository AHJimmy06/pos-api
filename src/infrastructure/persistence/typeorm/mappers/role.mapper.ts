import { Role } from '../../../../domain/entities/role.entity';
import { UserRole } from '../../../../domain/enums/user-role.enum';

export interface RawRoleRow {
  id: number;
  name: string;
  description?: string;
}

export class RoleMapper {
  static toEntity(raw: RawRoleRow): Role {
    const role = new Role(raw.name as UserRole, raw.description || undefined);
    role.id = raw.id;
    return role;
  }

  static toPersistence(entity: Role): Record<string, unknown> {
    return {
      NAME: entity.name,
      DESCRIPTION: entity.description,
    };
  }
}
