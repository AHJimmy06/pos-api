import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DashboardStatsQuery } from './dashboard-stats.query';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { TOKENS } from '../common/tokens/tokens';

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
  topProducts: never[];
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
    // Contar productos con contador simple
    const totalProducts = await this.productRepository.count();

    // Obtener stats de facturas usando SQL directo (sin cargar detalles)
    const invoiceStats = await this.invoiceRepository.getStats();

    // Últimos 7 días
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const salesByDay: SalesByDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = invoiceStats.salesByDay.find((d) => d.date === dateKey);
      salesByDay.push({
        date: dateKey,
        total: dayData?.total || 0,
        count: dayData?.count || 0,
      });
    }

    return {
      totalProducts,
      totalClients: 0,
      totalInvoices: invoiceStats.totalInvoices,
      totalSales: invoiceStats.totalSales,
      topProducts: [],
      salesByDay,
    };
  }
}
