import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';
import { IClientRepository } from '../../../../domain/repositories/client.repository.interface';
import { Client as ClientEntity } from '../../../../domain/entities/client.entity';
import { Prisma } from '@prisma/client';
import { ClientMapper } from '../mappers/client.mapper';
import { BusinessException } from '../../../../domain/exceptions/business.exception';
import { DeleteResult } from '../../../../domain/common/delete-result.interface';

@Injectable()
export class PrismaClientRepository extends IClientRepository {
  constructor(private readonly uow: PrismaUnitOfWork) {
    super();
  }

  private get prisma() {
    return this.uow.getClient();
  }

  async findAll(): Promise<ClientEntity[]> {
    const clients = await this.prisma.client.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    return clients.map((c) => ClientMapper.toEntity(c));
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: ClientEntity[]; total: number }> {
    const where: Prisma.ClientWhereInput = { isActive: true };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients.map((c) => ClientMapper.toEntity(c)),
      total,
    };
  }

  async findById(id: number): Promise<ClientEntity | null> {
    const client = await this.prisma.client.findFirst({
      where: { id, isActive: true },
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

  async delete(id: number): Promise<DeleteResult> {
    try {
      // Check for associated invoices
      const associationCount = await this.prisma.invoice.count({
        where: { clientId: id },
      });

      if (associationCount > 0) {
        // Soft delete if invoices exist
        await this.prisma.client.update({
          where: { id },
          data: { isActive: false },
        });
        return {
          id,
          deleteType: 'soft',
          message: `Client ${id} has ${associationCount} invoice(s). Marked as inactive.`,
        };
      } else {
        // Physical delete if no invoices exist
        await this.prisma.client.delete({
          where: { id },
        });
        return {
          id,
          deleteType: 'physical',
          message: `Client ${id} permanently deleted.`,
        };
      }
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
