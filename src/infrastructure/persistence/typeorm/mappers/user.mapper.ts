import { User } from '../../../../domain/entities/user.entity';
import { UserRole } from '../../../../domain/enums/user-role.enum';

interface UserRow {
  ID: number;
  USERNAME: string;
  NAME: string;
  LAST_NAME: string;
  CEDULA?: string;
  EMAIL: string;
  PASSWORD: string;
  IS_ACTIVE: number;
  CREATED_AT: Date;
  UPDATED_AT: Date;
  ROLE_NAME?: string;
}

export class UserMapper {
  static toEntity(raw: UserRow): User {
    const user = new User(
      raw.USERNAME,
      raw.NAME,
      raw.LAST_NAME,
      raw.EMAIL,
      raw.PASSWORD,
    );
    user.id = raw.ID;
    user.cedula = raw.CEDULA || null;
    user.isActive = raw.IS_ACTIVE === 1;
    user.createdAt = raw.CREATED_AT;
    user.updatedAt = raw.UPDATED_AT;
    user.roles = [UserRole.ADMINISTRATOR];
    return user;
  }

  static toPersistence(entity: User): {
    USERNAME: string;
    NAME: string;
    LAST_NAME: string;
    CEDULA: string | null;
    EMAIL: string;
    PASSWORD: string;
    IS_ACTIVE: number;
  } {
    return {
      USERNAME: entity.username,
      NAME: entity.name,
      LAST_NAME: entity.lastName,
      CEDULA: entity.cedula,
      EMAIL: entity.email,
      PASSWORD: entity.passwordHash,
      IS_ACTIVE: entity.isActive ? 1 : 0,
    };
  }
}
