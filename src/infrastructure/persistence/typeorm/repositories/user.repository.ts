import { Inject, Injectable } from '@nestjs/common';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DataSource } from 'typeorm';
import { User } from 'src/domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { IUserRepository } from 'src/application/common/interfaces/user.repository.interface';

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

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  private get manager() {
    return this.dataSource;
  }

  private mapRowsToUser(rows: UserRow[]): User | null {
    if (rows.length === 0) return null;

    const first = rows[0];
    const user = new User(
      first.USERNAME,
      first.NAME,
      first.LAST_NAME,
      first.EMAIL,
      first.PASSWORD,
    );
    user.id = first.ID;
    user.cedula = first.CEDULA || null;
    user.isActive = first.IS_ACTIVE === 1;
    user.createdAt = first.CREATED_AT;
    user.updatedAt = first.UPDATED_AT;

    const roles = new Set<string>();
    for (const row of rows) {
      if (row.ROLE_NAME) roles.add(row.ROLE_NAME);
    }
    user.roles = Array.from(roles) as any;

    return user;
  }

  async findById(id: number): Promise<User | null> {
    const rows = await this.manager.query(
      `SELECT u.ID, u.USERNAME, u.NAME, u.LAST_NAME, u.CEDULA, u.EMAIL, u.PASSWORD, u.IS_ACTIVE, u.CREATED_AT, u.UPDATED_AT,
              r.NAME as ROLE_NAME
       FROM USERS u
       LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
       LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
       WHERE u.ID = :id AND u.IS_ACTIVE = 1`,
      [id],
    );
    return this.mapRowsToUser(rows as UserRow[]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const rows = await this.manager.query(
      `SELECT u.ID, u.USERNAME, u.NAME, u.LAST_NAME, u.CEDULA, u.EMAIL, u.PASSWORD, u.IS_ACTIVE, u.CREATED_AT, u.UPDATED_AT,
              r.NAME as ROLE_NAME
       FROM USERS u
       LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
       LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
       WHERE u.USERNAME = :username AND u.IS_ACTIVE = 1`,
      [username],
    );
    return this.mapRowsToUser(rows as UserRow[]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.manager.query(
      `SELECT u.ID, u.USERNAME, u.NAME, u.LAST_NAME, u.CEDULA, u.EMAIL, u.PASSWORD, u.IS_ACTIVE, u.CREATED_AT, u.UPDATED_AT,
              r.NAME as ROLE_NAME
       FROM USERS u
       LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
       LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
       WHERE u.EMAIL = :email AND u.IS_ACTIVE = 1`,
      [email],
    );
    return this.mapRowsToUser(rows as UserRow[]);
  }

  async findByCedula(cedula: string): Promise<User | null> {
    const rows = await this.manager.query(
      `SELECT u.ID, u.USERNAME, u.NAME, u.LAST_NAME, u.CEDULA, u.EMAIL, u.PASSWORD, u.IS_ACTIVE, u.CREATED_AT, u.UPDATED_AT,
              r.NAME as ROLE_NAME
       FROM USERS u
       LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
       LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
       WHERE u.CEDULA = :cedula AND u.IS_ACTIVE = 1`,
      [cedula],
    );
    return this.mapRowsToUser(rows as UserRow[]);
  }

  async create(user: User, roleNames: string[]): Promise<User> {
    const persistence = UserMapper.toPersistence(user);

    await this.manager.query(
      `INSERT INTO USERS (USERNAME, NAME, LAST_NAME, CEDULA, EMAIL, PASSWORD, IS_ACTIVE)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [
        persistence.USERNAME,
        persistence.NAME,
        persistence.LAST_NAME,
        persistence.CEDULA,
        persistence.EMAIL,
        persistence.PASSWORD,
        persistence.IS_ACTIVE,
      ],
    );

    const created = await this.findByUsername(user.username);
    if (!created) {
      throw new Error('Failed to create user');
    }

    for (const roleName of roleNames) {
      await this.manager.query(
        `INSERT INTO USER_ROLES (USER_ID, ROLE_ID)
         SELECT :1, r.ID FROM ROLES r WHERE r.NAME = :2`,
        [created.id, roleName],
      );
    }

    const withRoles = await this.findById(created.id);
    return withRoles!;
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.manager.query(
      `UPDATE USERS SET NAME = :1, LAST_NAME = :2, EMAIL = :3, CEDULA = :4
       WHERE ID = :5`,
      [
        data.name || '',
        data.lastName || '',
        data.email || '',
        data.cedula || null,
        id,
      ],
    );
    const updated = await this.findById(id);
    return updated!;
  }

  async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
    await this.manager.query(`UPDATE USERS SET PASSWORD = :1 WHERE ID = :2`, [
      newPasswordHash,
      userId,
    ]);
  }

  async deactivate(userId: number): Promise<void> {
    await this.manager.query(`UPDATE USERS SET IS_ACTIVE = 0 WHERE ID = :1`, [
      userId,
    ]);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.manager.query(
      `SELECT 1 FROM USERS WHERE EMAIL = :email AND IS_ACTIVE = 1 AND ROWNUM = 1`,
      [email],
    );
    return result.length > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const result = await this.manager.query(
      `SELECT 1 FROM USERS WHERE USERNAME = :username AND IS_ACTIVE = 1 AND ROWNUM = 1`,
      [username],
    );
    return result.length > 0;
  }

  async existsByCedula(cedula: string): Promise<boolean> {
    const result = await this.manager.query(
      `SELECT 1 FROM USERS WHERE CEDULA = :cedula AND IS_ACTIVE = 1 AND ROWNUM = 1`,
      [cedula],
    );
    return result.length > 0;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.manager.query(
      `SELECT u.ID, u.USERNAME, u.NAME, u.LAST_NAME, u.CEDULA, u.EMAIL, u.PASSWORD, u.IS_ACTIVE, u.CREATED_AT, u.UPDATED_AT,
              r.NAME as ROLE_NAME
       FROM USERS u
       LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
       LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
       WHERE u.IS_ACTIVE = 1
       ORDER BY u.ID`,
    );

    const userMap = new Map<number, User>();
    for (const row of rows as UserRow[]) {
      if (!userMap.has(row.ID)) {
        const user = new User(
          row.USERNAME,
          row.NAME,
          row.LAST_NAME,
          row.EMAIL,
          row.PASSWORD,
        );
        user.id = row.ID;
        user.cedula = row.CEDULA || null;
        user.isActive = row.IS_ACTIVE === 1;
        user.createdAt = row.CREATED_AT;
        user.updatedAt = row.UPDATED_AT;
        user.roles = [];
        userMap.set(row.ID, user);
      }
      if (row.ROLE_NAME) {
        const user = userMap.get(row.ID)!;
        if (!user.roles.includes(row.ROLE_NAME as any)) {
          user.roles.push(row.ROLE_NAME as any);
        }
      }
    }

    return Array.from(userMap.values());
  }

  async findByRole(role: string): Promise<User[]> {
    // Find all users with the given role
    const allUsers = await this.findAll();
    return allUsers.filter((u) => u.roles.includes(role as any));
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: User[]; total: number }> {
    const offset = (page - 1) * limit;

    let sql = `SELECT u.ID, u.USERNAME, u.NAME, u.LAST_NAME, u.CEDULA, u.EMAIL, u.PASSWORD, u.IS_ACTIVE, u.CREATED_AT, u.UPDATED_AT
       FROM USERS u
       WHERE u.IS_ACTIVE = 1`;
    const params: any[] = [];

    if (search) {
      sql += ` AND (u.USERNAME LIKE :search OR u.NAME LIKE :search OR u.EMAIL LIKE :search)`;
      params.push(`%${search}%`);
    }

    const countSql =
      `SELECT COUNT(*) as CNT FROM USERS u WHERE u.IS_ACTIVE = 1` +
      (search
        ? ` AND (u.USERNAME LIKE :search OR u.NAME LIKE :search OR u.EMAIL LIKE :search)`
        : '');
    const countResult = await this.manager.query(countSql, params);
    const total = parseInt(countResult[0]?.CNT || '0', 10);

    const queryParams = [...params, offset, limit];
    const rows = await this.manager.query(
      sql + ` ORDER BY u.ID OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      queryParams,
    );

    const data = (rows as UserRow[]).map((row) => {
      const user = new User(
        row.USERNAME,
        row.NAME,
        row.LAST_NAME,
        row.EMAIL,
        row.PASSWORD,
      );
      user.id = row.ID;
      user.cedula = row.CEDULA || null;
      user.isActive = row.IS_ACTIVE === 1;
      user.createdAt = row.CREATED_AT;
      user.updatedAt = row.UPDATED_AT;
      user.roles = [];
      return user;
    });

    return { data, total };
  }

  async updateRoles(id: number, roleIds: number[]): Promise<User> {
    // Delete existing roles
    await this.manager.query(`DELETE FROM USER_ROLES WHERE USER_ID = :1`, [id]);

    // Insert new roles
    for (const roleId of roleIds) {
      await this.manager.query(
        `INSERT INTO USER_ROLES (USER_ID, ROLE_ID) VALUES (:1, :2)`,
        [id, roleId],
      );
    }

    return (await this.findById(id))!;
  }

  async softDelete(id: number): Promise<void> {
    await this.deactivate(id);
  }
}
