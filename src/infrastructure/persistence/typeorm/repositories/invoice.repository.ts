import { TOKENS } from '../../../../application/common/tokens/tokens';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Inject } from '@nestjs/common';
import { IInvoiceRepository } from '../../../../application/common/interfaces/invoice.repository.interface';
import { Invoice } from '../../../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../../../domain/entities/invoice-detail.entity';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { InvoiceMapper } from '../mappers/invoice.mapper';
import { DeleteResult } from '../../../../domain/common/delete-result.interface';

interface RawInvoiceDetailTax {
  id: number;
  taxId: number;
  rateSnapshot: number;
  calculatedAmountSnapshot: number;
}

interface RawInvoiceDetail {
  id: number;
  invoiceId: number;
  productId?: number;
  productName?: string;
  quantity?: number;
  unitPriceSnapshot: number;
  detailTaxes: RawInvoiceDetailTax[];
}

interface RawInvoice {
  id: number;
  clientId: number;
  userId?: number;
  issueDate: Date;
  subtotalSnapshot: number;
  taxTotalSnapshot: number;
  totalSnapshot: number;
  transactionId?: string;
  status: string;
  paymentMethod: string;
  isActive: number;
  version: number;
  details: RawInvoiceDetail[];
}

export class TypeOrmInvoiceRepository implements IInvoiceRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  async getStats(): Promise<{
    totalInvoices: number;
    totalSales: number;
    salesByDay: { date: string; total: number; count: number }[];
  }> {
    // Total invoices y ventas
    const statsResult = await this.manager.query(
      `SELECT COUNT(*) as CNT, COALESCE(SUM(TOTAL_SNAPSHOT), 0) as TOTAL
       FROM INVOICES WHERE IS_ACTIVE = 1`,
    );
    const totalInvoices = parseInt(statsResult[0]?.CNT || '0', 10);
    const totalSales = parseFloat(statsResult[0]?.TOTAL || '0');

    // Ventas por día (últimos 30 días para tener datos)
    const salesResult = await this.manager.query(
      `SELECT 
         TRUNC(ISSUE_DATE) as DAY,
         COUNT(*) as CNT,
         SUM(TOTAL_SNAPSHOT) as TOTAL
       FROM INVOICES 
       WHERE IS_ACTIVE = 1
         AND ISSUE_DATE >= SYSDATE - 30
       GROUP BY TRUNC(ISSUE_DATE)
       ORDER BY DAY`,
    );

    const salesByDay = (salesResult as any[]).map((row) => ({
      date: (row.DAY as Date).toISOString().split('T')[0],
      total: parseFloat(row.TOTAL || '0'),
      count: parseInt(row.CNT || '0', 10),
    }));

    return { totalInvoices, totalSales, salesByDay };
  }

  private async loadDetails(invoiceId: number): Promise<RawInvoiceDetail[]> {
    const detailRows = await this.manager.query(
      `SELECT d.ID, d.INVOICE_ID, d.PRODUCT_ID, d.PRODUCT_NAME, d.QUANTITY, d.UNIT_PRICE_SNAPSHOT
       FROM INVOICE_DETAILS d
       WHERE d.INVOICE_ID = :1`,
      [invoiceId],
    );

    const details: RawInvoiceDetail[] = [];
    for (const row of detailRows as any[]) {
      const taxRows = await this.manager.query(
        `SELECT ID, TAX_ID, RATE_SNAPSHOT, CALCULATED_AMOUNT_SNAPSHOT
         FROM INVOICE_DETAIL_TAXES WHERE DETAIL_ID = :1`,
        [row.ID],
      );

      const detailTaxes: RawInvoiceDetailTax[] = (taxRows as any[]).map(
        (taxRow) => ({
          id: taxRow.ID,
          taxId: taxRow.TAX_ID,
          rateSnapshot: taxRow.RATE_SNAPSHOT,
          calculatedAmountSnapshot: taxRow.CALCULATED_AMOUNT_SNAPSHOT,
        }),
      );

      details.push({
        id: row.ID,
        invoiceId: row.INVOICE_ID,
        productId: row.PRODUCT_ID,
        productName: row.PRODUCT_NAME,
        quantity: row.QUANTITY,
        unitPriceSnapshot: row.UNIT_PRICE_SNAPSHOT,
        detailTaxes,
      });
    }

    return details;
  }

  private mapRowToRawInvoice(row: any): RawInvoice {
    return {
      id: row.ID,
      clientId: row.CLIENT_ID,
      userId: row.USER_ID,
      issueDate: row.ISSUE_DATE,
      subtotalSnapshot: row.SUBTOTAL_SNAPSHOT,
      taxTotalSnapshot: row.TAX_TOTAL_SNAPSHOT,
      totalSnapshot: row.TOTAL_SNAPSHOT,
      transactionId: row.TRANSACTION_ID,
      status: row.STATUS,
      paymentMethod: row.PAYMENT_METHOD,
      isActive: row.IS_ACTIVE,
      version: row.VERSION,
      details: [],
    };
  }

  async findAll(): Promise<Invoice[]> {
    const rows = await this.manager.query(
      `SELECT i.ID, i.CLIENT_ID, i.USER_ID, i.ISSUE_DATE, i.SUBTOTAL_SNAPSHOT, i.TAX_TOTAL_SNAPSHOT,
              i.TOTAL_SNAPSHOT, i.TRANSACTION_ID, i.STATUS, i.PAYMENT_METHOD, i.IS_ACTIVE, i.VERSION
       FROM INVOICES i
       WHERE i.IS_ACTIVE = 1
       ORDER BY i.ID DESC`,
    );

    return Promise.all(
      (rows as any[]).map(async (row) => {
        const details = await this.loadDetails(row.ID);
        return InvoiceMapper.toEntity({
          ...this.mapRowToRawInvoice(row),
          details,
        });
      }),
    );
  }

  async findById(id: number): Promise<Invoice | null> {
    const rows = await this.manager.query(
      `SELECT i.ID, i.CLIENT_ID, i.USER_ID, i.ISSUE_DATE, i.SUBTOTAL_SNAPSHOT, i.TAX_TOTAL_SNAPSHOT,
              i.TOTAL_SNAPSHOT, i.TRANSACTION_ID, i.STATUS, i.PAYMENT_METHOD, i.IS_ACTIVE, i.VERSION
       FROM INVOICES i
       WHERE i.ID = :1 AND i.IS_ACTIVE = 1`,
      [id],
    );

    if (rows.length === 0) return null;

    const details = await this.loadDetails(rows[0].ID);
    return InvoiceMapper.toEntity({
      ...this.mapRowToRawInvoice(rows[0]),
      details,
    });
  }

  async findByTransactionId(transactionId: string): Promise<Invoice | null> {
    const rows = await this.manager.query(
      `SELECT i.ID, i.CLIENT_ID, i.USER_ID, i.ISSUE_DATE, i.SUBTOTAL_SNAPSHOT, i.TAX_TOTAL_SNAPSHOT,
              i.TOTAL_SNAPSHOT, i.TRANSACTION_ID, i.STATUS, i.PAYMENT_METHOD, i.IS_ACTIVE, i.VERSION
       FROM INVOICES i
       WHERE i.TRANSACTION_ID = :1 AND i.IS_ACTIVE = 1`,
      [transactionId],
    );

    if (rows.length === 0) return null;

    const details = await this.loadDetails(rows[0].ID);
    return InvoiceMapper.toEntity({
      ...this.mapRowToRawInvoice(rows[0]),
      details,
    });
  }

  async findByIdWithDetails(id: number): Promise<Invoice | null> {
    return this.findById(id);
  }

  async findByClientId(clientId: number): Promise<Invoice[]> {
    const rows = await this.manager.query(
      `SELECT i.ID, i.CLIENT_ID, i.USER_ID, i.ISSUE_DATE, i.SUBTOTAL_SNAPSHOT, i.TAX_TOTAL_SNAPSHOT,
              i.TOTAL_SNAPSHOT, i.TRANSACTION_ID, i.STATUS, i.PAYMENT_METHOD, i.IS_ACTIVE, i.VERSION
       FROM INVOICES i
       WHERE i.CLIENT_ID = :1 AND i.IS_ACTIVE = 1
       ORDER BY i.ID DESC`,
      [clientId],
    );

    return Promise.all(
      (rows as any[]).map(async (row) => {
        const details = await this.loadDetails(row.ID);
        return InvoiceMapper.toEntity({
          ...this.mapRowToRawInvoice(row),
          details,
        });
      }),
    );
  }

  async findByUserId(userId: number): Promise<Invoice[]> {
    const rows = await this.manager.query(
      `SELECT i.ID, i.CLIENT_ID, i.USER_ID, i.ISSUE_DATE, i.SUBTOTAL_SNAPSHOT, i.TAX_TOTAL_SNAPSHOT,
              i.TOTAL_SNAPSHOT, i.TRANSACTION_ID, i.STATUS, i.PAYMENT_METHOD, i.IS_ACTIVE, i.VERSION
       FROM INVOICES i
       WHERE i.USER_ID = :1 AND i.IS_ACTIVE = 1
       ORDER BY i.ID DESC`,
      [userId],
    );

    return Promise.all(
      (rows as any[]).map(async (row) => {
        const details = await this.loadDetails(row.ID);
        return InvoiceMapper.toEntity({
          ...this.mapRowToRawInvoice(row),
          details,
        });
      }),
    );
  }

  async findAllPaginated(
    page: number,
    limit: number,
    searchId?: number,
    userId?: number,
    _searchField?: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<{ data: Invoice[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereConditions: string[] = ['i.IS_ACTIVE = 1'];
    const params: any[] = [];

    if (searchId !== undefined && searchId !== null) {
      whereConditions.push('i.ID = :' + (params.length + 1));
      params.push(searchId);
    }

    if (userId !== undefined && userId !== null) {
      whereConditions.push('i.USER_ID = :' + (params.length + 1));
      params.push(userId);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const countResult = await this.manager.query(
      `SELECT COUNT(*) as CNT FROM INVOICES i ${whereClause}`,
      params,
    );
    const total = parseInt(countResult[0]?.CNT || '0', 10);

    const queryParams = [...params, offset, limit];
    const rows = await this.manager.query(
      `SELECT i.ID, i.CLIENT_ID, i.USER_ID, i.ISSUE_DATE, i.SUBTOTAL_SNAPSHOT, i.TAX_TOTAL_SNAPSHOT,
              i.TOTAL_SNAPSHOT, i.TRANSACTION_ID, i.STATUS, i.PAYMENT_METHOD, i.IS_ACTIVE, i.VERSION
       FROM INVOICES i
       ${whereClause}
       ORDER BY i.ID DESC
       OFFSET :${params.length + 1} ROWS FETCH NEXT :${params.length + 2} ROWS ONLY`,
      queryParams,
    );

    const data = await Promise.all(
      (rows as any[]).map(async (row) => {
        const details = await this.loadDetails(row.ID);
        return InvoiceMapper.toEntity({
          ...this.mapRowToRawInvoice(row),
          details,
        });
      }),
    );

    return { data, total };
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const persistence = InvoiceMapper.toPersistence(invoice);

    // Get unitPriceSnapshot from getter
    const getUnitPrice = (detail: InvoiceDetail): number => {
      const d = detail as any;

      return typeof d.unitPriceSnapshot === 'function'
        ? /* eslint-disable-line @typescript-eslint/no-unsafe-call */ d.unitPriceSnapshot()
        : d.unitPriceSnapshot;
    };

    // Insert invoice WITHOUT RETURNING clause - Oracle DB driver doesn't support out binds well
    await this.manager.query(
      `INSERT INTO INVOICES (CLIENT_ID, USER_ID, ISSUE_DATE, SUBTOTAL_SNAPSHOT, TAX_TOTAL_SNAPSHOT,
                             TOTAL_SNAPSHOT, TRANSACTION_ID, STATUS, PAYMENT_METHOD, IS_ACTIVE)
       VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)`,
      [
        persistence.CLIENT_ID,
        persistence.USER_ID,
        persistence.ISSUE_DATE,
        persistence.SUBTOTAL_SNAPSHOT,
        persistence.TAX_TOTAL_SNAPSHOT,
        persistence.TOTAL_SNAPSHOT,
        persistence.TRANSACTION_ID,
        persistence.STATUS,
        persistence.PAYMENT_METHOD,
        persistence.IS_ACTIVE,
      ],
    );

    // Oracle doesn't return insertId reliably, so get the ID via transactionId or MAX
    let invoiceId: number | undefined;

    // Try by transactionId first (most reliable)
    if (persistence.TRANSACTION_ID) {
      const existing = await this.findByTransactionId(
        persistence.TRANSACTION_ID,
      );
      if (existing) invoiceId = existing.id;
    }

    // Fallback: get the most recent invoice for this client
    if (!invoiceId && persistence.CLIENT_ID) {
      const rows = await this.manager.query(
        `SELECT MAX(ID) as MAX_ID FROM INVOICES WHERE CLIENT_ID = :1`,
        [persistence.CLIENT_ID],
      );
      invoiceId = rows[0]?.MAX_ID;
    }

    // Last resort: get the global most recent
    if (!invoiceId) {
      const rows = await this.manager.query(
        `SELECT MAX(ID) as MAX_ID FROM INVOICES`,
        [],
      );
      invoiceId = rows[0]?.MAX_ID;
    }

    if (!invoiceId) {
      throw new Error('Failed to retrieve created invoice ID');
    }

    console.log('[createInvoice] invoiceId:', invoiceId);

    // Insert details
    for (const detail of invoice.details) {
      const unitPrice = getUnitPrice(detail);

      // Insert detail WITHOUT RETURNING clause
      await this.manager.query(
        `INSERT INTO INVOICE_DETAILS (INVOICE_ID, PRODUCT_ID, PRODUCT_NAME, QUANTITY, UNIT_PRICE_SNAPSHOT)
         VALUES (:1, :2, :3, :4, :5)`,
        [
          invoiceId,
          detail.productId,
          detail.productName,
          detail.quantity,
          unitPrice,
        ],
      );

      // Get detail ID by finding the most recent detail for this invoice/product
      const detailRows = await this.manager.query(
        `SELECT MAX(ID) as MAX_ID FROM INVOICE_DETAILS
         WHERE INVOICE_ID = :1 AND PRODUCT_ID = :2`,
        [invoiceId, detail.productId],
      );
      const detailId = detailRows[0]?.MAX_ID;

      if (!detailId) {
        throw new Error(
          `Failed to insert detail for product ${detail.productId}`,
        );
      }

      // Insert detail taxes
      for (const detailTax of detail.detailTaxes) {
        await this.manager.query(
          `INSERT INTO INVOICE_DETAIL_TAXES (DETAIL_ID, TAX_ID, RATE_SNAPSHOT, CALCULATED_AMOUNT_SNAPSHOT)
           VALUES (:1, :2, :3, :4)`,
          [
            detailId,
            detailTax.taxId,
            detailTax.rateSnapshot,
            detailTax.calculatedAmountSnapshot,
          ],
        );
      }
    }

    // Return the invoice directly from data we already have
    // Don't call findById - Oracle may not see uncommitted data from this transaction
    invoice.id = invoiceId;
    console.log('[createInvoice] Returning invoice with id:', invoiceId);
    return invoice;
  }

  async update(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    const fields: string[] = [];
    const values: any[] = [];

    if (invoice.status !== undefined) {
      fields.push('STATUS = :' + (values.length + 1));
      values.push(invoice.status);
    }
    if (invoice.paymentMethod !== undefined) {
      fields.push('PAYMENT_METHOD = :' + (values.length + 1));
      values.push(invoice.paymentMethod);
    }
    if (invoice.isActive !== undefined) {
      fields.push('IS_ACTIVE = :' + (values.length + 1));
      values.push(invoice.isActive ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(id);
      const result = await this.manager.query(
        `UPDATE INVOICES SET ${fields.join(', ')}, VERSION = VERSION + 1
         WHERE ID = :${values.length} AND IS_ACTIVE = 1`,
        values,
      );

      if (!result || result.rowsAffected === 0) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated invoice');
    }
    return updated;
  }

  async cancel(id: number): Promise<Invoice> {
    const updated = await this.update(id, {
      status: 'CANCELLED',
      isActive: false,
    } as Partial<Invoice>);
    return updated;
  }

  async delete(id: number): Promise<DeleteResult> {
    const invoice = await this.findById(id);
    if (!invoice) {
      throw new Error(`Invoice ${id} not found`);
    }

    await this.manager.query(`DELETE FROM INVOICES WHERE ID = :1`, [id]);

    return {
      id,
      deleteType: 'physical',
      message: `Invoice ${id} deleted successfully`,
    };
  }

  async existsByTransactionId(transactionId: string): Promise<boolean> {
    const result = await this.manager.query(
      `SELECT 1 FROM INVOICES WHERE TRANSACTION_ID = :1 AND ROWNUM = 1`,
      [transactionId],
    );
    return result.length > 0;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]> {
    const rows = await this.manager.query(
      `SELECT i.ID, i.CLIENT_ID, i.USER_ID, i.ISSUE_DATE, i.SUBTOTAL_SNAPSHOT, i.TAX_TOTAL_SNAPSHOT,
              i.TOTAL_SNAPSHOT, i.TRANSACTION_ID, i.STATUS, i.PAYMENT_METHOD, i.IS_ACTIVE, i.VERSION
       FROM INVOICES i
       WHERE i.ISSUE_DATE BETWEEN :1 AND :2 AND i.IS_ACTIVE = 1
       ORDER BY i.ID DESC`,
      [startDate, endDate],
    );

    return Promise.all(
      (rows as any[]).map(async (row) => {
        const details = await this.loadDetails(row.ID);
        return InvoiceMapper.toEntity({
          ...this.mapRowToRawInvoice(row),
          details,
        });
      }),
    );
  }
}
