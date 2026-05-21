import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInvoiceCommand } from '../commands/create-invoice.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';
import { IClientRepository } from '../../../domain/repositories/client.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ITaxRepository } from '../../../domain/repositories/tax.repository.interface';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../../domain/entities/invoice-detail.entity';
import { BusinessException } from '../../../domain/exceptions/business.exception';

@CommandHandler(CreateInvoiceCommand)
export class CreateInvoiceHandler implements ICommandHandler<CreateInvoiceCommand> {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(command: CreateInvoiceCommand): Promise<Invoice> {
    const {
      clientId,
      items,
      subtotalSnapshot,
      taxTotalSnapshot,
      totalSnapshot,
    } = command;

    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const invoice = new Invoice(clientId);

    for (const item of items) {
      // Fresh stock check before reduce (Opción C)
      const productData = await this.productRepository.findById(item.productId);
      if (!productData) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (productData.stock < item.quantity) {
        throw new BusinessException(
          `Stock insuficiente para producto ${item.productId}. Disponible: ${productData.stock}, solicitado: ${item.quantity}`,
        );
      }

      const success = await this.productRepository.reduceStock({
        productId: item.productId,
        quantity: item.quantity,
        expectedVersion: productData.version,
      });

      if (!success) {
        const current = await this.productRepository
          .findById(item.productId)
          .catch(() => null);
        if (!current) {
          throw new BusinessException(
            `Error de concurrencia con producto ${item.productId}. Reintente la operación.`,
          );
        }
        throw new BusinessException(
          current.stock < item.quantity
            ? `Stock insuficiente para producto ${item.productId}. Disponible: ${current.stock}, solicitado: ${item.quantity}`
            : `El stock del producto ${item.productId} fue modificado por otro proceso. Reintente.`,
        );
      }

      // Use provided snapshot data, fallback to product data
      const productName = item.productName || productData.name;
      const unitPrice = item.unitPrice ?? Number(productData.price);

      const detail = new InvoiceDetail(
        productData.id,
        item.quantity,
        unitPrice,
      );
      detail.productName = productName;

      // Handle taxes: snapshot array takes precedence, fallback to impuestoIds
      if (item.taxes && item.taxes.length > 0) {
        for (const t of item.taxes) {
          detail.addTax(t.taxId, t.rate);
          // Override calculated amount with provided value
          const lastTax = detail.detailTaxes[detail.detailTaxes.length - 1];
          lastTax.calculatedAmountSnapshot = t.calculatedAmount;
        }
      } else if (item.impuestoIds && item.impuestoIds.length > 0) {
        for (const taxId of item.impuestoIds) {
          const tax = await this.taxRepository.findById(taxId);
          if (!tax) {
            throw new NotFoundException(`Tax with ID ${taxId} not found`);
          }
          detail.addTax(tax.id, Number(tax.currentRate));
        }
      }

      invoice.addDetail(detail);
    }

    // Set snapshots from provided totals or calculate from details
    if (totalSnapshot !== undefined) {
      invoice.setSnapshots(
        subtotalSnapshot ?? invoice.subtotalSnapshot,
        taxTotalSnapshot ?? invoice.taxTotalSnapshot,
        totalSnapshot,
      );
    }

    // Validate totals if provided (with ±0.01 tolerance)
    if (totalSnapshot !== undefined) {
      const serverSubtotal = invoice.subtotalSnapshot;
      const serverTaxTotal = invoice.taxTotalSnapshot;
      const serverTotal = invoice.totalSnapshot;

      if (
        Math.abs(serverSubtotal - (subtotalSnapshot ?? serverSubtotal)) > 0.01
      ) {
        throw new BusinessException(
          `Subtotal mismatch: provided ${subtotalSnapshot}, calculated ${serverSubtotal}`,
        );
      }
      if (
        Math.abs(serverTaxTotal - (taxTotalSnapshot ?? serverTaxTotal)) > 0.01
      ) {
        throw new BusinessException(
          `Tax total mismatch: provided ${taxTotalSnapshot}, calculated ${serverTaxTotal}`,
        );
      }
      if (Math.abs(serverTotal - totalSnapshot) > 0.01) {
        throw new BusinessException(
          `Total mismatch: provided ${totalSnapshot}, calculated ${serverTotal}`,
        );
      }
    }

    return this.invoiceRepository.create(invoice);
  }
}
