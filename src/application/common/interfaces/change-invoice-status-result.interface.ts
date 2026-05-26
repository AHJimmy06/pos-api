import { Invoice } from '../../../domain/entities/invoice.entity';
import { StockMovement } from '../../../domain/entities/stock-movement.entity';

export interface ChangeInvoiceStatusResult {
  invoice: Invoice;
  stockMovements: StockMovement[];
}
