import { CreateInvoiceItem } from './create-invoice.command';

export class UpdateInvoiceCommand {
  constructor(
    public readonly id: number,
    public readonly clientId?: number,
    public readonly items?: CreateInvoiceItem[],
    public readonly userId?: number,
  ) {}
}
