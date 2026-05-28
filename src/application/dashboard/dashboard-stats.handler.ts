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
    // Obtener todas las facturas (para calcular stats)
    const allInvoices = await this.invoiceRepository.findAll();

    // Contar productos
    const products = await this.productRepository.findAll();
    const totalProducts = products.length;

    // Calcular ventas totales y grouping
    let totalSales = 0;
    const salesByDayMap = new Map<string, { total: number; count: number }>();
    const productSalesMap = new Map<
      number,
      { name: string; quantity: number; revenue: number }
    >();

    for (const invoice of allInvoices) {
      const invoiceTotal = invoice.totalSnapshot || 0;
      totalSales += invoiceTotal;

      // Agrupar por día
      const dateKey = invoice.issueDate.toISOString().split('T')[0];
      const existing = salesByDayMap.get(dateKey) || { total: 0, count: 0 };
      salesByDayMap.set(dateKey, {
        total: existing.total + invoiceTotal,
        count: existing.count + 1,
      });

      // Agrupar ventas por producto desde los details
      if (invoice.details && invoice.details.length > 0) {
        for (const detail of invoice.details) {
          const productName = this.getProductName(products, detail.productId);
          const existing = productSalesMap.get(detail.productId) || {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
          productSalesMap.set(detail.productId, {
            name: existing.name,
            quantity: existing.quantity + detail.quantity,
            revenue: existing.revenue + (detail.subtotal || 0),
          });
        }
      }
    }

    // Top 5 productos
    const topProducts: TopProduct[] = Array.from(productSalesMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantitySold: data.quantity,
        totalRevenue: data.revenue,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

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
      totalInvoices: allInvoices.length,
      totalSales,
      topProducts,
      salesByDay,
    };
  }

  private getProductName(
    products: { id: number; name: string }[],
    productId: number,
  ): string {
    const product = products.find((p) => p.id === productId);
    return product?.name || `Product ${productId}`;
  }
}
