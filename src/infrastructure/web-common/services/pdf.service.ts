import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { IPdfService } from '../../../application/common/interfaces/pdf-service.interface';

@Injectable()
export class PdfService extends IPdfService {
  async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    console.log('Starting PDF generation for TRX:', invoice.transactionId);
    return new Promise((resolve, reject) => {
      try {
        let doc: PDFKit.PDFDocument;
        try {
          // Attempt different instantiation methods for pdfkit
          if (typeof PDFDocument === 'function') {
            doc = new (PDFDocument as any)({ margin: 50, size: 'A4' });
          } else if ((PDFDocument as any).default) {
            doc = new (PDFDocument as any).default({ margin: 50, size: 'A4' });
          } else {
            // Fallback for some commonjs/esm interop issues
            const PDFDoc = require('pdfkit');
            doc = new PDFDoc({ margin: 50, size: 'A4' });
          }
        } catch (e) {
          console.error('Failed to instantiate PDFDocument:', e);
          return reject(new InternalServerErrorException('Could not initialize PDF engine'));
        }

        const chunks: any[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          console.log('PDF generation finished successfully');
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', (err) => {
          console.error('PDF Stream Error:', err);
          reject(err);
        });

        const safeNum = (val: any) => {
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        };

        const formatMoney = (val: any) =>
          `$${safeNum(val).toLocaleString('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;

        console.log('Adding header content...');
        // --- CONTENT GENERATION ---
        doc.fillColor('#444444').fontSize(20).text('POS SYSTEM - FACTURA DE VENTA', { align: 'center' });
        doc.fontSize(10).text(`Inmutable / Registro Histórico de Auditoría`, { align: 'center' });
        doc.moveDown();

        const topY = doc.y;
        doc.fontSize(10).fillColor('#000000');
        doc.text(`TRX ID: ${invoice.transactionId || 'N/A'}`, 50, topY);
        doc.text(
          `Fecha: ${invoice.issueDate ? invoice.issueDate.toLocaleString() : 'N/A'}`,
          50,
          topY + 15,
        );

        console.log('Adding snapshots content...');
        doc.moveDown(2);
        const client = invoice.clientSnapshot;
        const seller = invoice.sellerSnapshot;

        const infoY = doc.y;
        doc.fontSize(12).font('Helvetica-Bold').text('Información del Cliente', 50, infoY);
        doc.fontSize(10).font('Helvetica');
        if (client) {
          doc.text(`${client.firstName || ''} ${client.lastName || ''}`, 50, infoY + 15);
          doc.text(`Email: ${client.email || 'N/A'}`, 50, infoY + 27);
          doc.text(`Dirección: ${client.address || 'N/A'}`, 50, infoY + 39);
        } else {
          doc.text('Datos originales no disponibles', 50, infoY + 15);
        }

        doc.fontSize(12).font('Helvetica-Bold').text('Vendedor', 350, infoY);
        doc.fontSize(10).font('Helvetica');
        if (seller) {
          doc.text(`${seller.name || ''} ${seller.lastName || ''}`, 350, infoY + 15);
          doc.text(`ID: ${seller.cedula || 'N/A'}`, 350, infoY + 27);
        } else {
          doc.text('No registrado', 350, infoY + 15);
        }

        console.log('Adding items table...');
        doc.moveDown(5);
        const tableTop = doc.y;
        doc.font('Helvetica-Bold').fontSize(10);
        this.generateTableRow(doc, tableTop, 'Producto', 'Cant.', 'P. Unitario', 'Subtotal');
        this.generateHr(doc, tableTop + 15);

        doc.font('Helvetica');
        let currentY = tableTop + 25;
        const details = invoice.details || [];

        details.forEach((item, index) => {
          const qty = safeNum(item.quantity);
          const price = safeNum(item.unitPriceSnapshot);
          const subtotal = qty * price;

          this.generateTableRow(
            doc,
            currentY,
            item.productName || 'N/A',
            qty.toString(),
            formatMoney(price),
            formatMoney(subtotal),
          );
          this.generateHr(doc, currentY + 15);
          currentY += 25;

          // Check for page overflow
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
        });

        console.log('Adding totals...');
        const totalsY = currentY + 10;
        doc.font('Helvetica-Bold');

        doc.text('Subtotal:', 350, totalsY);
        doc.text(formatMoney(invoice.subtotalSnapshot), 450, totalsY, { align: 'right' });

        doc.text('Impuestos:', 350, totalsY + 20);
        doc.text(formatMoney(invoice.taxTotalSnapshot), 450, totalsY + 20, { align: 'right' });

        doc.fontSize(14);
        doc.text('TOTAL:', 350, totalsY + 45);
        doc.text(formatMoney(invoice.totalSnapshot), 450, totalsY + 45, { align: 'right' });

        doc.end();
      } catch (err) {
        console.error('CRITICAL PDF ERROR:', err);
        reject(new InternalServerErrorException('Error constructing PDF file: ' + (err as Error).message));
      }
    });
  }

  private generateTableRow(doc: any, y: number, item: string, qty: string, price: string, total: string) {
    doc.text(item, 50, y, { width: 200 })
       .text(qty, 250, y, { width: 50, align: 'right' })
       .text(price, 320, y, { width: 100, align: 'right' })
       .text(total, 450, y, { width: 100, align: 'right' });
  }

  private generateHr(doc: any, y: number) {
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  }
}
