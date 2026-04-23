import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IClientRepository } from '../../../../domain/clients/repositories/client.repository.interface';
import { Client as ClientEntity } from '../../../../domain/clients/entities/client.entity';
import { Prisma, Client as PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaClientRepository extends IClientRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<ClientEntity[]> {
    const clients = await this.prisma.client.findMany();
    return clients.map((client) => this.mapToEntity(client));
  }

  async findById(id: number): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });
    return client ? this.mapToEntity(client) : null;
  }

  async create(client: ClientEntity): Promise<ClientEntity> {
    const newClient = await this.prisma.client.create({
      data: {
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        address: client.address,
        email: client.email,
      },
    });
    return this.mapToEntity(newClient);
  }

  async update(
    id: number,
    client: Partial<ClientEntity>,
  ): Promise<ClientEntity> {
    try {
      const updatedClient = await this.prisma.client.update({
        where: { id },
        data: {
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          address: client.address,
          email: client.email,
        },
      });
      return this.mapToEntity(updatedClient);
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

  private mapToEntity(prismaClient: PrismaClient): ClientEntity {
    const client = new ClientEntity();
    client.id = prismaClient.id;
    client.firstName = prismaClient.firstName ?? '';
    client.lastName = prismaClient.lastName ?? '';
    client.phone = prismaClient.phone ?? '';
    client.address = prismaClient.address ?? '';
    client.email = prismaClient.email ?? '';
    return client;
  }
}
