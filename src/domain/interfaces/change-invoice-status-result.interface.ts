import { Invoice } from '../entities/invoice.entity';
import { StockMovement } from '../entities/stock-movement.entity';

export interface ChangeInvoiceStatusResult {
  invoice: Invoice;
  stockMovements: StockMovement[];
}
