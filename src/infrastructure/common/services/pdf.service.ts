import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { User } from '../../../domain/entities/user.entity';
import { Client } from '../../../domain/entities/client.entity';

@Injectable()
export class PdfService {
  async generateInvoicePdf(
    invoice: Invoice,
    client: Client | null,
    seller: User | null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const doc: PDFKit.PDFDocument = new (PDFDocument as any)({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('POS SYSTEM - INVOICE', 110, 57)
        .fontSize(10)
        .text(`Invoice Number: ${invoice.id || 'N/A'}`, 200, 65, {
          align: 'right',
        })
        .text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 200, 80, {
          align: 'right',
        })
        .moveDown();

      // Client Info
      doc
        .fillColor('#000000')
        .fontSize(12)
        .text('Client Information:', 50, 160)
        .fontSize(10)
        .text(
          `Name: ${client ? `${client.firstName} ${client.lastName}` : 'N/A'}`,
          50,
          175,
        )
        .text(`Email: ${client?.email || 'N/A'}`, 50, 190)
        .text(`Address: ${client?.address || 'N/A'}`, 50, 205);

      // Seller Info
      doc
        .fontSize(12)
        .text('Seller Info:', 350, 160)
        .fontSize(10)
        .text(
          `Vendedor: ${seller ? `${seller.name} ${seller.lastName}` : 'N/A'}`,
          350,
          175,
        )
        .moveDown();

      // Table Header
      const tableTop = 270;
      doc.font('Helvetica-Bold');
      this.generateTableRow(
        doc,
        tableTop,
        'Product',
        'Quantity',
        'Unit Price',
        'Total',
      );
      this.generateHr(doc, tableTop + 20);
      doc.font('Helvetica');

      // Table Rows
      let i = 0;
      invoice.details.forEach((detail) => {
        const position = tableTop + (i + 1) * 30;
        this.generateTableRow(
          doc,
          position,
          detail.productName || 'Unknown',
          detail.quantity.toString(),
          `$${detail.unitPriceSnapshot.toFixed(2)}`,
          `$${detail.subtotal.toFixed(2)}`,
        );
        this.generateHr(doc, position + 20);
        i++;
      });

      // Totals
      const subtotalPosition = tableTop + (i + 1) * 30 + 20;
      doc.font('Helvetica-Bold');
      this.generateTableRow(
        doc,
        subtotalPosition,
        '',
        '',
        'Subtotal:',
        `$${invoice.subtotalSnapshot.toFixed(2)}`,
      );

      const taxPosition = subtotalPosition + 20;
      this.generateTableRow(
        doc,
        taxPosition,
        '',
        '',
        'IVA:',
        `$${invoice.taxTotalSnapshot.toFixed(2)}`,
      );

      const totalPosition = taxPosition + 25;
      doc.fontSize(15);
      this.generateTableRow(
        doc,
        totalPosition,
        '',
        '',
        'TOTAL:',
        `$${invoice.totalSnapshot.toFixed(2)}`,
      );

      doc.end();
    });
  }

  private generateTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    item: string,
    quantity: string,
    unitPrice: string,
    total: string,
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(quantity, 280, y, { width: 90, align: 'right' })
      .text(unitPrice, 370, y, { width: 90, align: 'right' })
      .text(total, 0, y, { align: 'right' });
  }

  private generateHr(doc: PDFKit.PDFDocument, y: number) {
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
}
