import { InvoiceStatus } from '../../../domain/enums/invoice-status.enum';

export class ChangeInvoiceStatusCommand {
  constructor(
    public readonly id: number,
    public readonly status: InvoiceStatus,
    public readonly userId?: number,
  ) {}
}
