import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IClientRepository } from '../../../../domain/repositories/client.repository.interface';
import { Client as ClientEntity } from '../../../../domain/entities/client.entity';
import { Prisma } from '@prisma/client';
import { ClientMapper } from '../mappers/client.mapper';
import { BusinessException } from '../../../../domain/exceptions/business.exception';

@Injectable()
export class PrismaClientRepository extends IClientRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

async findAll(): Promise<ClientEntity[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { id: 'asc' },
    });
    return clients.map(ClientMapper.toEntity);
  }

  async findById(id: number): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });
    return client ? ClientMapper.toEntity(client) : null;
  }

  async create(client: ClientEntity): Promise<ClientEntity> {
    try {
      const newClient = await this.prisma.client.create({
        data: ClientMapper.toPersistence(client),
      });
      return ClientMapper.toEntity(newClient);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BusinessException(
          `A client with this information already exists`,
          'DUPLICATE_CLIENT',
        );
      }
      throw error;
    }
  }

  async update(
    id: number,
    client: Partial<ClientEntity>,
  ): Promise<ClientEntity> {
    try {
      const data: Prisma.ClientUpdateInput = {};
      if (client.firstName) data.firstName = client.firstName;
      if (client.lastName) data.lastName = client.lastName;
      if (client.email) data.email = client.email;
      if (client.phone) data.phone = client.phone;
      if (client.address) data.address = client.address;

      const updatedClient = await this.prisma.client.update({
        where: { id },
        data,
      });
      return ClientMapper.toEntity(updatedClient);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.client.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      throw error;
    }
  }
}
