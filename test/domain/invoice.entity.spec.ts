import { Invoice } from '../../src/domain/entities/invoice.entity';
import { InvoiceDetail } from '../../src/domain/entities/invoice-detail.entity';

describe('Invoice Entity', () => {
  it('should calculate totals correctly with taxes', () => {
    const invoice = new Invoice(1); // Client ID 1
    
    // Detalle 1: 2 unidades de $100 c/u = $200
    const detail1 = new InvoiceDetail(101, 2, 100);
    detail1.addTax(1, 15); // 15% de $200 = $30
    
    // Detalle 2: 1 unidad de $50 c/u = $50
    const detail2 = new InvoiceDetail(102, 1, 50);
    detail2.addTax(2, 10); // 10% de $50 = $5
    
    invoice.addDetail(detail1);
    invoice.addDetail(detail2);

    // Totales esperados:
    // Subtotal: 200 + 50 = 250
    // Impuestos: 30 + 5 = 35
    // Total: 250 + 35 = 285
    
    expect(invoice.subtotalSnapshot).toBe(250);
    expect(invoice.taxTotalSnapshot).toBe(35);
    expect(invoice.totalSnapshot).toBe(285);
  });

  it('should generate a transaction ID on creation', () => {
    const invoice = new Invoice(1);
    expect(invoice.transactionId).toMatch(/^TRX-/);
  });
});
