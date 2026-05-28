import { Client as ClientEntity } from '../../../../domain/entities/client.entity';

export interface RawClientRow {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class ClientMapper {
  static toEntity(raw: RawClientRow): ClientEntity {
    const entity = new ClientEntity(
      raw.firstName || '',
      raw.lastName || '',
      raw.email || '',
    );
    entity.id = raw.id;
    entity.phone = raw.phone || '';
    entity.address = raw.address || '';
    entity.isActive = raw.isActive === 1;
    return entity;
  }

  static toPersistence(entity: ClientEntity): Record<string, unknown> {
    return {
      FIRST_NAME: entity.firstName,
      LAST_NAME: entity.lastName,
      EMAIL: entity.email,
      PHONE: entity.phone,
      ADDRESS: entity.address,
      IS_ACTIVE: entity.isActive ? 1 : 0,
    };
  }
}
