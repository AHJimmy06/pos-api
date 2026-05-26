import { Injectable } from '@nestjs/common';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';
import { IUserRepository } from '../../../../application/common/interfaces/user.repository.interface';
import { User } from '../../../../domain/entities/user.entity';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly uow: PrismaUnitOfWork) {}

  private get prisma() {
    return this.uow.getClient();
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: { roles: { include: { role: true } } },
    });
    return users.map((u) => this.mapToDomain(u));
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cedula: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { roles: { include: { role: true } } },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => this.mapToDomain(u)),
      total,
    };
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { roles: { include: { role: true } } },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async create(user: User, roleNames: string[]): Promise<User> {
    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } },
    });

    const created = await this.prisma.user.create({
      data: {
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        cedula: user.cedula,
        email: user.email,
        password: user.passwordHash,
        isActive: user.isActive,
        roles: {
          create: roles.map((r) => ({ roleId: r.id })),
        },
      },
      include: { roles: { include: { role: true } } },
    });

    return this.mapToDomain(created);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        lastName: data.lastName,
        cedula: data.cedula,
        email: data.email,
        password: data.passwordHash,
        isActive: data.isActive,
      },
      include: { roles: { include: { role: true } } },
    });
    return this.mapToDomain(updated);
  }

  async updateRoles(id: number, roleIds: number[]): Promise<User> {
    // Delete existing roles
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // Create new roles
    await this.prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({
        userId: id,
        roleId,
      })),
    });

    // Return updated user
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.mapToDomain(user);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { username } });
    return count > 0;
  }

  private mapToDomain(prismaUser: {
    id: number;
    username: string;
    name: string;
    lastName: string;
    cedula: string | null;
    email: string;
    password: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    roles: { role: { name: string } }[];
  }): User {
    const user = new User(
      prismaUser.username,
      prismaUser.name,
      prismaUser.lastName,
      prismaUser.email,
      prismaUser.password,
    );
    user.id = prismaUser.id;
    user.cedula = prismaUser.cedula;
    user.isActive = prismaUser.isActive;
    user.roles = prismaUser.roles.map((ur) => ur.role.name as UserRole);
    return user;
  }
}
