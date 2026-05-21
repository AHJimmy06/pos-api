import { CreateInvoiceHandler } from './create-invoice.handler';
import { GetInvoicesHandler } from './get-invoices.handler';
import { GetInvoiceHandler } from './get-invoice.handler';
import { UpdateInvoiceHandler } from './update-invoice.handler';
import { ChangeInvoiceStatusHandler } from './change-invoice-status.handler';

export const InvoiceHandlers = [
  CreateInvoiceHandler,
  GetInvoicesHandler,
  GetInvoiceHandler,
  UpdateInvoiceHandler,
  ChangeInvoiceStatusHandler,
];
