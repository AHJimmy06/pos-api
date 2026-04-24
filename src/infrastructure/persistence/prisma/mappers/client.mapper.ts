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
    return entity;
  }

  static toPersistence(entity: ClientEntity): any {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      address: entity.address,
    };
  }
}
