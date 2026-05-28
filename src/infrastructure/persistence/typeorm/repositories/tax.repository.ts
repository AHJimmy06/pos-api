import { TOKENS } from '../../../../application/common/tokens/tokens';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Inject } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { ITaxRepository } from '../../../../application/common/interfaces/tax.repository.interface';
import { Tax } from '../../../../domain/entities/tax.entity';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { TaxMapper } from '../mappers/tax.mapper';

export class TypeOrmTaxRepository implements ITaxRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  async findAll(): Promise<Tax[]> {
    const rows = await this.manager.query(
      `SELECT ID, NAME, CURRENT_RATE FROM TAXES ORDER BY NAME ASC`,
    );

    return rows.map((row) =>
      TaxMapper.toEntity({
        id: row.ID as number,
        name: row.NAME as string | undefined,
        currentRate: Number(row.CURRENT_RATE),
      }),
    );
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    searchField: string = 'all',
  ): Promise<{ data: Tax[]; total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (search) {
      if (searchField === 'name') {
        whereClause += ` AND NAME LIKE :search`;
        params.push(`%${search}%`);
      } else if (searchField === 'id') {
        const idNum = parseInt(search, 10);
        if (!isNaN(idNum)) {
          whereClause += ` AND ID = :id`;
          params.push(idNum);
        }
      }
    }

    const countResult = await this.manager.query(
      `SELECT COUNT(*) as CNT FROM TAXES ${whereClause}`,
      params,
    );
    const total = parseInt(countResult[0]?.CNT || '0', 10);

    const rows = await this.manager.query(
      `SELECT ID, NAME, CURRENT_RATE
       FROM TAXES ${whereClause}
       ORDER BY NAME ASC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      [...params, offset, limit],
    );

    return {
      data: rows.map((row) =>
        TaxMapper.toEntity({
          id: row.ID as number,
          name: row.NAME as string | undefined,
          currentRate: Number(row.CURRENT_RATE),
        }),
      ),
      total,
    };
  }

  async findById(id: number): Promise<Tax | null> {
    const rows = await this.manager.query(
      `SELECT ID, NAME, CURRENT_RATE FROM TAXES WHERE ID = :1`,
      [id],
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return TaxMapper.toEntity({
      id: row.ID as number,
      name: row.NAME as string | undefined,
      currentRate: Number(row.CURRENT_RATE),
    });
  }

  async findByIds(ids: number[]): Promise<Tax[]> {
    if (ids.length === 0) return [];

    // Build parameterized IN clause dynamically
    const inClause = ids.map((_, i) => `:p${i}`).join(', ');
    const sql = `SELECT ID, NAME, CURRENT_RATE FROM TAXES WHERE ID IN (${inClause})`;
    const rows = await this.manager.query(sql, ids);

    return rows.map((row) =>
      TaxMapper.toEntity({
        id: row.ID as number,
        name: row.NAME as string | undefined,
        currentRate: Number(row.CURRENT_RATE),
      }),
    );
  }

  async create(tax: Tax): Promise<Tax> {
    const result = await this.manager.query(
      `INSERT INTO TAXES (NAME, CURRENT_RATE) VALUES (:1, :2)`,
      [tax.name, tax.currentRate],
    );

    if (!result || !result.rowsAffected || result.rowsAffected === 0) {
      throw new Error('Failed to create tax');
    }

    const insertedRow = await this.findById(result.insertId as number);
    if (!insertedRow) {
      throw new Error('Failed to retrieve created tax');
    }
    return insertedRow;
  }

  async update(id: number, tax: Partial<Tax>): Promise<Tax> {
    const fields: string[] = [];
    const values: Record<string, string | number | undefined> = {};

    if (tax.name !== undefined) {
      fields.push('NAME = :name');
      values.name = tax.name;
    }
    if (tax.currentRate !== undefined) {
      fields.push('CURRENT_RATE = :currentRate');
      values.currentRate = tax.currentRate;
    }

    if (fields.length === 0) {
      return (await this.findById(id))!;
    }

    values.id = id;
    const result = await this.manager.query(
      `UPDATE TAXES SET ${fields.join(', ')} WHERE ID = :id`,
      [values],
    );

    if (!result || result.rowsAffected === 0) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    return (await this.findById(id))!;
  }

  async delete(id: number): Promise<void> {
    // Check for product associations
    const productTaxCount = await this.manager.query(
      `SELECT COUNT(*) as CNT FROM PRODUCT_TAXES WHERE TAX_ID = :1`,
      [id],
    );

    const count = parseInt(productTaxCount[0]?.CNT || '0', 10);
    if (count > 0) {
      throw new Error(
        `Cannot delete Tax ${id}: ${count} product(s) are associated`,
      );
    }

    const result = await this.manager.query(`DELETE FROM TAXES WHERE ID = :1`, [
      id,
    ]);

    if (!result || result.rowsAffected === 0) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }
  }
}
