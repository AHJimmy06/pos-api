import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInvoiceCommand } from '../commands/create-invoice.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';
import { IClientRepository } from '../../../domain/repositories/client.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ITaxRepository } from '../../../domain/repositories/tax.repository.interface';
import { IStockMovementRepository } from '../../../domain/repositories/stock-movement.repository.interface';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../../domain/entities/invoice-detail.entity';
import { StockMovement } from '../../../domain/entities/stock-movement.entity';
import { BusinessException } from '../../../domain/exceptions/business.exception';
import { InvoiceStatus } from '../../../domain/enums/invoice-status.enum';
import { MovementType } from '../../../domain/enums/movement-type.enum';

@CommandHandler(CreateInvoiceCommand)
export class CreateInvoiceHandler
  implements ICommandHandler<CreateInvoiceCommand>
{
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(command: CreateInvoiceCommand): Promise<Invoice> {
    const {
      clientId,
      items,
      status,
      userId,
      subtotalSnapshot,
      taxTotalSnapshot,
      totalSnapshot,
    } = command;

    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const invoice = new Invoice(clientId);
    invoice.status = status || InvoiceStatus.CONFIRMED;

    for (const item of items) {
      const productData = await this.productRepository.findById(item.productId);
      if (!productData) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Regla de Negocio: El stock solo se descuenta si la factura se CONFIRMA
      if (invoice.status === InvoiceStatus.CONFIRMED) {
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
          throw new BusinessException(
            `Error de concurrencia o stock insuficiente para producto ${item.productId}. Reintente.`,
          );
        }

        // AuditorÃ­a: Registrar Movimiento de Stock
        await this.stockMovementRepository.create(
          new StockMovement({
            productId: item.productId,
            type: MovementType.EXIT,
            quantity: item.quantity,
            previousStock: productData.stock,
            newStock: productData.stock - item.quantity,
            userId: userId,
            reference: `Venta - TransacciÃ³n ${invoice.transactionId}`,
          }),
        );
      }

      const unitPrice = item.unitPrice ?? Number(productData.price);
      const detail = new InvoiceDetail(productData.id, item.quantity, unitPrice);
      detail.productName = item.productName || productData.name;

      if (item.taxes && item.taxes.length > 0) {
        for (const t of item.taxes) {
          detail.addTax(t.taxId, t.rate);
          const lastTax = detail.detailTaxes[detail.detailTaxes.length - 1];
          lastTax.calculatedAmountSnapshot = t.calculatedAmount;
        }
      } else if (item.impuestoIds && item.impuestoIds.length > 0) {
        for (const taxId of item.impuestoIds) {
          const tax = await this.taxRepository.findById(taxId);
          if (tax) {
            detail.addTax(tax.id, Number(tax.currentRate));
          }
        }
      }

      invoice.addDetail(detail);
    }

    if (totalSnapshot !== undefined) {
      invoice.setSnapshots(
        subtotalSnapshot ?? invoice.subtotalSnapshot,
        taxTotalSnapshot ?? invoice.taxTotalSnapshot,
        totalSnapshot,
      );
    }

    return this.invoiceRepository.create(invoice);
  }
}
