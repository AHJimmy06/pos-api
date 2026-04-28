export class TaxSnapshot {
  taxId: number;
  rate: number;
  calculatedAmount: number;
}

export class CreateInvoiceItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
  taxes?: TaxSnapshot[];
  impuestoIds?: number[];
}

export class CreateInvoiceCommand {
  constructor(
    public readonly clientId: number,
    public readonly items: CreateInvoiceItem[],
    public readonly subtotalSnapshot?: number,
    public readonly taxTotalSnapshot?: number,
    public readonly totalSnapshot?: number,
  ) {}
}
