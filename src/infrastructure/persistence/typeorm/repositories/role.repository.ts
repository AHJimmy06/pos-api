import { TOKENS } from '../../../../application/common/tokens/tokens';
import { Inject } from '@nestjs/common';
import { IRoleRepository } from '../../../../application/common/interfaces/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { RoleMapper } from '../mappers/role.mapper';

export class TypeOrmRoleRepository implements IRoleRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  async findById(id: number): Promise<Role | null> {
    const rows = await this.manager.query(
      `SELECT ID, NAME, DESCRIPTION FROM ROLES WHERE ID = :1`,
      [id],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return RoleMapper.toEntity({
      id: row.ID as number,
      name: row.NAME as string,
      description: row.DESCRIPTION as string | undefined,
    });
  }

  async findByName(name: UserRole): Promise<Role | null> {
    const rows = await this.manager.query(
      `SELECT ID, NAME, DESCRIPTION FROM ROLES WHERE NAME = :1`,
      [name],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return RoleMapper.toEntity({
      id: row.ID as number,
      name: row.NAME as string,
      description: row.DESCRIPTION as string | undefined,
    });
  }

  async findByNames(names: UserRole[]): Promise<Role[]> {
    if (names.length === 0) return [];

    // Build parameterized IN clause dynamically
    const inClause = names.map((_, i) => `:p${i}`).join(', ');
    const sql = `SELECT ID, NAME, DESCRIPTION FROM ROLES WHERE NAME IN (${inClause})`;
    const rows = await this.manager.query(sql, names);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return rows.map((row) =>
      RoleMapper.toEntity({
        id: row.ID as number,
        name: row.NAME as string,
        description: row.DESCRIPTION as string | undefined,
      }),
    );
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    if (ids.length === 0) return [];

    // Build parameterized IN clause dynamically
    const inClause = ids.map((_, i) => `:p${i}`).join(', ');
    const sql = `SELECT ID, NAME, DESCRIPTION FROM ROLES WHERE ID IN (${inClause})`;
    const rows = await this.manager.query(sql, ids);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return rows.map((row) =>
      RoleMapper.toEntity({
        id: row.ID as number,
        name: row.NAME as string,
        description: row.DESCRIPTION as string | undefined,
      }),
    );
  }

  async findAll(): Promise<Role[]> {
    const rows = await this.manager.query(
      `SELECT ID, NAME, DESCRIPTION FROM ROLES ORDER BY NAME ASC`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return rows.map((row) =>
      RoleMapper.toEntity({
        id: row.ID as number,
        name: row.NAME as string,
        description: row.DESCRIPTION as string | undefined,
      }),
    );
  }
}
