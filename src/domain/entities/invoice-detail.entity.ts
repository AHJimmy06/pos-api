import { BusinessException } from '../exceptions/business.exception';
import { InvoiceDetailTax } from './invoice-detail-tax.entity';
import { Price } from '../value-objects/price.value-object';

export class InvoiceDetail {
  id: number = 0;
  invoiceId?: number;
  productId: number;
  productName: string = '';
  quantity: number;
  private _unitPriceSnapshot: Price;
  detailTaxes: InvoiceDetailTax[] = [];

  constructor(productId: number, quantity: number, unitPrice: number) {
    if (quantity <= 0) {
      throw new BusinessException('Quantity must be greater than zero');
    }
    this.productId = productId;
    this.quantity = quantity;
    this._unitPriceSnapshot = new Price(unitPrice);
  }

  get unitPriceSnapshot(): number {
    return this._unitPriceSnapshot.getValue();
  }

  // Explicitly exclude private fields from JSON serialization
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      unitPriceSnapshot: this.unitPriceSnapshot,
      subtotal: this.subtotal,
      taxTotal: this.taxTotal,
      detailTaxes: this.detailTaxes,
    };
  }

  addTax(taxId: number, rate: number): void {
    const detailTax = new InvoiceDetailTax();
    detailTax.taxId = taxId;
    detailTax.rateSnapshot = rate; // Aquí se podría usar Percentage si se quisiera
    detailTax.calculatedAmountSnapshot = this.subtotal * (rate / 100);
    this.detailTaxes.push(detailTax);
  }

  get subtotal(): number {
    return this.unitPriceSnapshot * this.quantity;
  }

  get taxTotal(): number {
    return this.detailTaxes.reduce(
      (sum, tax) => sum + tax.calculatedAmountSnapshot,
      0,
    );
  }
}
