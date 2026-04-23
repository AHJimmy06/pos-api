import { InvoiceDetailTax } from './invoice-detail-tax.entity';

describe('InvoiceDetailTax', () => {
  it('should create an InvoiceDetailTax instance', () => {
    const detailTax = new InvoiceDetailTax();
    detailTax.id = 1;
    detailTax.detailId = 10;
    detailTax.taxId = 5;
    detailTax.rateSnapshot = 0.15;
    detailTax.calculatedAmountSnapshot = 1.5;

    expect(detailTax.id).toBe(1);
    expect(detailTax.detailId).toBe(10);
    expect(detailTax.taxId).toBe(5);
    expect(detailTax.rateSnapshot).toBe(0.15);
    expect(detailTax.calculatedAmountSnapshot).toBe(1.5);
  });
});
