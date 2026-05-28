import { TOKENS } from '../../../../application/common/tokens/tokens';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../../../application/common/interfaces/product.repository.interface';
import { Product } from '../../../../domain/entities/product.entity';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { ProductMapper } from '../mappers/product.mapper';
import { DeleteResult } from '../../../../domain/common/delete-result.interface';

export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  private async getProductTaxIds(productId: number): Promise<number[]> {
    const rows = await this.manager.query(
      `SELECT TAX_ID FROM PRODUCT_TAXES WHERE PRODUCT_ID = :1`,
      [productId],
    );
    return rows.map((row: any) => row.TAX_ID as number);
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.manager.query(
      `SELECT p.ID, p.NAME, p.PRICE, p.STOCK, p.VERSION, p.IS_ACTIVE
       FROM PRODUCTS p
       WHERE p.IS_ACTIVE = 1
       ORDER BY p.ID ASC`,
    );

    return Promise.all(
      rows.map(async (row: any) => {
        const taxIds = await this.getProductTaxIds(row.ID);
        return ProductMapper.toEntity({
          id: row.ID,
          name: row.NAME,
          price: row.PRICE,
          stock: row.STOCK,
          version: row.VERSION,
          isActive: row.IS_ACTIVE,
          taxIds,
        });
      }),
    );
  }

  async findById(id: number): Promise<Product | null> {
    const rows = await this.manager.query(
      `SELECT p.ID, p.NAME, p.PRICE, p.STOCK, p.VERSION, p.IS_ACTIVE
       FROM PRODUCTS p
       WHERE p.ID = :1 AND p.IS_ACTIVE = 1`,
      [id],
    );

    if (rows.length === 0) return null;

    const taxIds = await this.getProductTaxIds(rows[0].ID);
    return ProductMapper.toEntity({
      id: rows[0].ID,
      name: rows[0].NAME,
      price: rows[0].PRICE,
      stock: rows[0].STOCK,
      version: rows[0].VERSION,
      isActive: rows[0].IS_ACTIVE,
      taxIds,
    });
  }

  async findByName(name: string): Promise<Product | null> {
    const rows = await this.manager.query(
      `SELECT p.ID, p.NAME, p.PRICE, p.STOCK, p.VERSION, p.IS_ACTIVE
       FROM PRODUCTS p
       WHERE p.NAME = :1 AND p.IS_ACTIVE = 1`,
      [name],
    );

    if (rows.length === 0) return null;

    const taxIds = await this.getProductTaxIds(rows[0].ID);
    return ProductMapper.toEntity({
      id: rows[0].ID,
      name: rows[0].NAME,
      price: rows[0].PRICE,
      stock: rows[0].STOCK,
      version: rows[0].VERSION,
      isActive: rows[0].IS_ACTIVE,
      taxIds,
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    searchField?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.IS_ACTIVE = 1';
    const params: any[] = [];

    if (search) {
      if (searchField === 'name') {
        whereClause += ' AND p.NAME LIKE :1';
        params.push(`%${search}%`);
      } else if (searchField === 'id') {
        const idNum = parseInt(search, 10);
        if (!isNaN(idNum)) {
          whereClause += ' AND p.ID = :1';
          params.push(idNum);
        }
      } else {
        whereClause += ' AND p.NAME LIKE :1';
        params.push(`%${search}%`);
      }
    }

    const countResult = await this.manager.query(
      `SELECT COUNT(*) as CNT FROM PRODUCTS p ${whereClause}`,
      params,
    );
    const total = parseInt(countResult[0]?.CNT || '0', 10);

    const queryParams = [...params, offset, limit];
    const rows = await this.manager.query(
      `SELECT p.ID, p.NAME, p.PRICE, p.STOCK, p.VERSION, p.IS_ACTIVE
       FROM PRODUCTS p
       ${whereClause}
       ORDER BY p.ID
       OFFSET :${params.length + 1} ROWS FETCH NEXT :${params.length + 2} ROWS ONLY`,
      queryParams,
    );

    const data = await Promise.all(
      rows.map(async (row: any) => {
        const taxIds = await this.getProductTaxIds(row.ID);
        return ProductMapper.toEntity({
          id: row.ID,
          name: row.NAME,
          price: row.PRICE,
          stock: row.STOCK,
          version: row.VERSION,
          isActive: row.IS_ACTIVE,
          taxIds,
        });
      }),
    );

    return { data, total };
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const placeholders = ids.map((_, i) => `:${i + 1}`).join(', ');
    const rows = await this.manager.query(
      `SELECT p.ID, p.NAME, p.PRICE, p.STOCK, p.VERSION, p.IS_ACTIVE
       FROM PRODUCTS p
       WHERE p.ID IN (${placeholders}) AND p.IS_ACTIVE = 1`,
      ids,
    );

    return Promise.all(
      rows.map(async (row: any) => {
        const taxIds = await this.getProductTaxIds(row.ID);
        return ProductMapper.toEntity({
          id: row.ID,
          name: row.NAME,
          price: row.PRICE,
          stock: row.STOCK,
          version: row.VERSION,
          isActive: row.IS_ACTIVE,
          taxIds,
        });
      }),
    );
  }

  async create(product: Product): Promise<Product> {
    const persistence = ProductMapper.toPersistence(product);

    await this.manager.query(
      `INSERT INTO PRODUCTS (NAME, PRICE, STOCK, IS_ACTIVE)
       VALUES (:1, :2, :3, :4)`,
      [
        persistence.NAME,
        persistence.PRICE,
        persistence.STOCK,
        persistence.IS_ACTIVE,
      ],
    );

    // Get created product by name
    const created = await this.findByName(product.name);
    if (!created) {
      throw new Error('Failed to create product');
    }

    // Insert product tax relations
    if (product.taxIds && product.taxIds.length > 0) {
      for (const taxId of product.taxIds) {
        await this.manager.query(
          `INSERT INTO PRODUCT_TAXES (PRODUCT_ID, TAX_ID) VALUES (:1, :2)`,
          [created.id, taxId],
        );
      }
    }

    const result = await this.findById(created.id);
    return result!;
  }

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const fields: string[] = [];
    const values: any[] = [];

    if (product.name !== undefined) {
      fields.push('NAME = :' + (values.length + 1));
      values.push(product.name);
    }
    if (product.price !== undefined) {
      fields.push('PRICE = :' + (values.length + 1));
      values.push(Number(product.price));
    }
    if (product.stock !== undefined) {
      fields.push('STOCK = :' + (values.length + 1));
      values.push(product.stock);
    }

    if (fields.length > 0 || (product as any).taxIds !== undefined) {
      if (fields.length > 0) {
        values.push(id);
        const result = await this.manager.query(
          `UPDATE PRODUCTS SET ${fields.join(', ')} WHERE ID = :${values.length} AND IS_ACTIVE = 1`,
          values,
        );

        if (!result || result.rowsAffected === 0) {
          throw new Error(`Product with ID ${id} not found`);
        }
      }

      // Update tax relations if provided
      if ((product as any).taxIds !== undefined) {
        const taxIds = (product as any).taxIds;

        // Delete existing
        await this.manager.query(
          `DELETE FROM PRODUCT_TAXES WHERE PRODUCT_ID = :1`,
          [id],
        );

        // Insert new
        for (const taxId of taxIds) {
          await this.manager.query(
            `INSERT INTO PRODUCT_TAXES (PRODUCT_ID, TAX_ID) VALUES (:1, :2)`,
            [id, taxId],
          );
        }
      }
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated product');
    }
    return updated;
  }

  async deactivate(id: number): Promise<void> {
    await this.manager.query(
      `UPDATE PRODUCTS SET IS_ACTIVE = 0 WHERE ID = :1`,
      [id],
    );
  }

  async delete(id: number): Promise<DeleteResult> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error(`Product ${id} not found`);
    }

    await this.manager.query(`DELETE FROM PRODUCTS WHERE ID = :1`, [id]);

    return {
      id,
      deleteType: 'physical',
      message: `Product ${id} deleted successfully`,
    };
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await this.manager.query(
      `SELECT 1 FROM PRODUCTS WHERE NAME = :1 AND IS_ACTIVE = 1 AND ROWNUM = 1`,
      [name],
    );
    return result.length > 0;
  }

  async decrementStock(
    id: number,
    quantity: number,
    expectedVersion: number,
  ): Promise<Product> {
    const result = await this.manager.query(
      `UPDATE PRODUCTS
       SET STOCK = STOCK - :1, VERSION = VERSION + 1
       WHERE ID = :2 AND VERSION = :3 AND STOCK >= :4
       RETURNING ID INTO :5`,
      [quantity, id, expectedVersion, quantity, { type: 'NUMBER', dir: 'OUT' }],
    );

    if (!result || result.rowsAffected === 0) {
      throw new Error(
        'Failed to decrement stock - version mismatch or insufficient stock',
      );
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to retrieve product after stock update');
    }
    return updated;
  }

  async incrementStock(
    id: number,
    quantity: number,
    expectedVersion: number,
  ): Promise<Product> {
    const result = await this.manager.query(
      `UPDATE PRODUCTS
       SET STOCK = STOCK + :1, VERSION = VERSION + 1
       WHERE ID = :2 AND VERSION = :3
       RETURNING ID INTO :4`,
      [quantity, id, expectedVersion, { type: 'NUMBER', dir: 'OUT' }],
    );

    if (!result || result.rowsAffected === 0) {
      throw new Error('Failed to increment stock - version mismatch');
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to retrieve product after stock update');
    }
    return updated;
  }

  async findByStockRange(min: number, max: number): Promise<Product[]> {
    const rows = await this.manager.query(
      `SELECT p.ID, p.NAME, p.PRICE, p.STOCK, p.VERSION, p.IS_ACTIVE
       FROM PRODUCTS p
       WHERE p.STOCK BETWEEN :1 AND :2 AND p.IS_ACTIVE = 1
       ORDER BY p.ID`,
      [min, max],
    );

    return Promise.all(
      rows.map(async (row: any) => {
        const taxIds = await this.getProductTaxIds(row.ID);
        return ProductMapper.toEntity({
          id: row.ID,
          name: row.NAME,
          price: row.PRICE,
          stock: row.STOCK,
          version: row.VERSION,
          isActive: row.IS_ACTIVE,
          taxIds,
        });
      }),
    );
  }

  async findForSale(
    page: number,
    limit: number,
    search?: string,
    searchField?: string,
  ): Promise<{ data: Product[]; total: number }> {
    return this.findAllPaginated(page, limit, search, searchField);
  }

  async reduceStock(params: {
    productId: number;
    quantity: number;
    expectedVersion: number;
  }): Promise<boolean> {
    try {
      await this.decrementStock(
        params.productId,
        params.quantity,
        params.expectedVersion,
      );
      return true;
    } catch {
      return false;
    }
  }

  async addStock(params: {
    productId: number;
    quantity: number;
    expectedVersion: number;
  }): Promise<boolean> {
    try {
      await this.incrementStock(
        params.productId,
        params.quantity,
        params.expectedVersion,
      );
      return true;
    } catch {
      return false;
    }
  }
}
