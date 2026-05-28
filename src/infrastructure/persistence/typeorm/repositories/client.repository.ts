import { TOKENS } from '../../../../application/common/tokens/tokens';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Inject } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../../../application/common/interfaces/client.repository.interface';
import { Client as ClientEntity } from '../../../../domain/entities/client.entity';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { ClientMapper } from '../mappers/client.mapper';
import { DeleteResult } from '../../../../domain/common/delete-result.interface';

export class TypeOrmClientRepository implements IClientRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  async findAll(): Promise<ClientEntity[]> {
    const rows = await this.manager.query(
      `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS, IS_ACTIVE, CREATED_AT, UPDATED_AT, DELETED_AT
       FROM CLIENTS
       WHERE IS_ACTIVE = 1 AND DELETED_AT IS NULL
       ORDER BY ID ASC`,
    );

    return rows.map((row) =>
      ClientMapper.toEntity({
        id: row.ID as number,
        firstName: row.FIRST_NAME as string | undefined,
        lastName: row.LAST_NAME as string | undefined,
        email: row.EMAIL as string | undefined,
        phone: row.PHONE as string | undefined,
        address: row.ADDRESS as string | undefined,
        isActive: row.IS_ACTIVE as number,
        createdAt: row.CREATED_AT as Date,
        updatedAt: row.UPDATED_AT as Date | undefined,
        deletedAt: row.DELETED_AT as Date | undefined,
      }),
    );
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    searchField: string = 'all',
  ): Promise<{ data: ClientEntity[]; total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE IS_ACTIVE = 1 AND DELETED_AT IS NULL';
    const params: Record<string, string | number> = {};

    if (search) {
      if (searchField === 'name') {
        whereClause += ` AND (FIRST_NAME LIKE :search OR LAST_NAME LIKE :search)`;
        params.search = `%${search}%`;
      } else if (searchField === 'email') {
        whereClause += ` AND EMAIL LIKE :search`;
        params.search = `%${search}%`;
      } else if (searchField === 'phone') {
        whereClause += ` AND PHONE LIKE :search`;
        params.search = `%${search}%`;
      } else if (searchField === 'id') {
        const idNum = parseInt(search, 10);
        if (!isNaN(idNum)) {
          whereClause += ` AND ID = :searchId`;
          params.searchId = idNum;
        }
      } else {
        whereClause += ` AND (FIRST_NAME LIKE :search OR LAST_NAME LIKE :search OR EMAIL LIKE :search OR PHONE LIKE :search OR ADDRESS LIKE :search)`;
        params.search = `%${search}%`;
      }
    }

    const countResult = await this.manager.query(
      `SELECT COUNT(*) as CNT FROM CLIENTS ${whereClause}`,
      params as unknown as any[],
    );
    const total = parseInt(countResult[0]?.CNT || '0', 10);

    // Use positional parameters for OFFSET/FETCH (Oracle supports both)
    const rows = await this.manager.query(
      `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS, IS_ACTIVE, CREATED_AT, UPDATED_AT, DELETED_AT
       FROM CLIENTS ${whereClause}
       ORDER BY ID ASC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { ...params, offset, limit } as unknown as any[],
    );

    return {
      data: rows.map((row) =>
        ClientMapper.toEntity({
          id: row.ID as number,
          firstName: row.FIRST_NAME as string | undefined,
          lastName: row.LAST_NAME as string | undefined,
          email: row.EMAIL as string | undefined,
          phone: row.PHONE as string | undefined,
          address: row.ADDRESS as string | undefined,
          isActive: row.IS_ACTIVE as number,
          createdAt: row.CREATED_AT as Date,
          updatedAt: row.UPDATED_AT as Date | undefined,
          deletedAt: row.DELETED_AT as Date | undefined,
        }),
      ),
      total,
    };
  }

  async findById(id: number): Promise<ClientEntity | null> {
    const rows = await this.manager.query(
      `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS, IS_ACTIVE, CREATED_AT, UPDATED_AT, DELETED_AT
       FROM CLIENTS
       WHERE ID = :id AND IS_ACTIVE = 1 AND DELETED_AT IS NULL`,
      [id],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return ClientMapper.toEntity({
      id: row.ID as number,
      firstName: row.FIRST_NAME as string | undefined,
      lastName: row.LAST_NAME as string | undefined,
      email: row.EMAIL as string | undefined,
      phone: row.PHONE as string | undefined,
      address: row.ADDRESS as string | undefined,
      isActive: row.IS_ACTIVE as number,
      createdAt: row.CREATED_AT as Date,
      updatedAt: row.UPDATED_AT as Date | undefined,
      deletedAt: row.DELETED_AT as Date | undefined,
    });
  }

  async create(client: ClientEntity): Promise<ClientEntity> {
    // Use RETURNING INTO with Oracle out binds via Promise-based query
    const result = await this.manager.query(
      `INSERT INTO CLIENTS (FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS, IS_ACTIVE)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        client.firstName,
        client.lastName,
        client.email,
        client.phone,
        client.address,
        client.isActive ? 1 : 0,
      ],
    );

    if (!result || !result.rowsAffected || result.rowsAffected === 0) {
      throw new Error('Failed to create client');
    }

    // For Oracle, we need to get the inserted ID via a separate query
    // This is a simplified approach - in production, use sequences or RETURNING clause properly
    const insertedRow = await this.findById(result.insertId as number);
    if (!insertedRow) {
      throw new Error('Failed to retrieve created client');
    }
    return insertedRow;
  }

  async update(
    id: number,
    client: Partial<ClientEntity>,
  ): Promise<ClientEntity> {
    const fields: string[] = [];
    const values: Record<string, string | number | undefined> = {};

    if (client.firstName !== undefined) {
      fields.push('FIRST_NAME = :firstName');
      values.firstName = client.firstName;
    }
    if (client.lastName !== undefined) {
      fields.push('LAST_NAME = :lastName');
      values.lastName = client.lastName;
    }
    if (client.email !== undefined) {
      fields.push('EMAIL = :email');
      values.email = client.email;
    }
    if (client.phone !== undefined) {
      fields.push('PHONE = :phone');
      values.phone = client.phone;
    }
    if (client.address !== undefined) {
      fields.push('ADDRESS = :address');
      values.address = client.address;
    }

    if (fields.length === 0) {
      return (await this.findById(id))!;
    }

    values.id = id;
    const result = await this.manager.query(
      `UPDATE CLIENTS SET ${fields.join(', ')} WHERE ID = :id`,
      [values],
    );

    if (!result || result.rowsAffected === 0) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return (await this.findById(id))!;
  }

  async delete(id: number): Promise<DeleteResult> {
    const invoiceCount = await this.manager.query(
      `SELECT COUNT(*) as CNT FROM INVOICES WHERE CLIENT_ID = :id`,
      [id],
    );

    const count = parseInt(invoiceCount[0]?.CNT || '0', 10);

    if (count > 0) {
      await this.manager.query(
        `UPDATE CLIENTS SET IS_ACTIVE = 0 WHERE ID = :id`,
        [id],
      );
      return {
        id,
        deleteType: 'soft',
        message: `Client ${id} has ${count} invoice(s). Marked as inactive.`,
      };
    } else {
      await this.manager.query(`DELETE FROM CLIENTS WHERE ID = :id`, [id]);
      return {
        id,
        deleteType: 'physical',
        message: `Client ${id} permanently deleted.`,
      };
    }
  }
}
