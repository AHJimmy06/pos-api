import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DashboardStatsQuery } from './dashboard-stats.query';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { TOKENS } from '../common/tokens/tokens';

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface SalesByDay {
  date: string;
  total: number;
  count: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalClients: number;
  totalInvoices: number;
  totalSales: number;
  topProducts: TopProduct[];
  salesByDay: SalesByDay[];
}

@QueryHandler(DashboardStatsQuery)
export class DashboardStatsHandler implements IQueryHandler<DashboardStatsQuery> {
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(_query: DashboardStatsQuery): Promise<DashboardStats> {
    // Contar productos
    const products = await this.productRepository.findAll();
    const totalProducts = products.length;

    // Para ventas totales y grouping, usamos una consulta más eficiente
    // que solo obtiene los totales de las facturas
    let totalSales = 0;
    let totalInvoices = 0;
    const salesByDayMap = new Map<string, { total: number; count: number }>();

    // Obtener todas las facturas solo con datos de la tabla principal
    // (sin detalles para evitar N+1 queries)
    const allInvoices = await this.invoiceRepository.findAll();

    for (const invoice of allInvoices) {
      const invoiceTotal = invoice.totalSnapshot || 0;
      totalSales += invoiceTotal;
      totalInvoices++;

      // Agrupar por día
      const dateKey = invoice.issueDate.toISOString().split('T')[0];
      const existing = salesByDayMap.get(dateKey) || { total: 0, count: 0 };
      salesByDayMap.set(dateKey, {
        total: existing.total + invoiceTotal,
        count: existing.count + 1,
      });
    }

    // Últimos 7 días
    const salesByDay: SalesByDay[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = salesByDayMap.get(dateKey);
      salesByDay.push({
        date: dateKey,
        total: dayData?.total || 0,
        count: dayData?.count || 0,
      });
    }

    return {
      totalProducts,
      totalClients: 0,
      totalInvoices,
      totalSales,
      topProducts: [], // Top products requiere consultar detalles, lo hacemos separately si es necesario
      salesByDay,
    };
  }
}
