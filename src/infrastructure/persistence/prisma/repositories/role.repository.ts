import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: UserRole): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });
    return role ? this.mapToDomain(role) : null;
  }

  async findByNames(names: UserRole[]): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: { name: { in: names } },
    });
    return roles.map((r) => this.mapToDomain(r));
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany();
    return roles.map((r) => this.mapToDomain(r));
  }

  private mapToDomain(prismaRole: {
    id: number;
    name: string;
    description: string | null;
  }): Role {
    const role = new Role(
      prismaRole.name as UserRole,
      prismaRole.description ?? undefined,
    );
    (role as unknown as { id: number }).id = prismaRole.id;
    return role;
  }
}
