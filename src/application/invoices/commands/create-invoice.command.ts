export class CreateInvoiceItem {
  productId: number;
  quantity: number;
  impuestoIds: number[];
}

export class CreateInvoiceCommand {
  constructor(
    public readonly clientId: number,
    public readonly items: CreateInvoiceItem[],
  ) {}
}
