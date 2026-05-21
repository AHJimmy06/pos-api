import { Client as ClientEntity } from '../../../../domain/entities/client.entity';
import { Client as PrismaClient } from '@prisma/client';

export class ClientMapper {
  static toEntity(prismaClient: PrismaClient): ClientEntity {
    const entity = new ClientEntity(
      prismaClient.firstName || '',
      prismaClient.lastName || '',
      prismaClient.email || '',
    );
    entity.id = prismaClient.id;
    entity.phone = prismaClient.phone || '';
    entity.address = prismaClient.address || '';
    entity.isActive = prismaClient.isActive;
    return entity;
  }

  static toPersistence(entity: ClientEntity) {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      address: entity.address,
      isActive: entity.isActive,
    };
  }
}
