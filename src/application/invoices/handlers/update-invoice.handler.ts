import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateInvoiceCommand } from '../commands/update-invoice.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ITaxRepository } from '../../../domain/repositories/tax.repository.interface';
import { IUnitOfWork } from '../../../domain/repositories/unit-of-work.interface';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../../domain/entities/invoice-detail.entity';
import { BusinessException } from '../../../domain/exceptions/business.exception';
import { InvoiceStatus } from '../../../domain/enums/invoice-status.enum';

@CommandHandler(UpdateInvoiceCommand)
export class UpdateInvoiceHandler implements ICommandHandler<UpdateInvoiceCommand> {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
    @Inject('IUnitOfWork')
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: UpdateInvoiceCommand): Promise<Invoice> {
    return this.uow.runInTransaction(async () => {
      const { id, clientId, items } = command;

      const invoice = await this.invoiceRepository.findByIdWithDetails(id);
      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      // Validar que la factura esté en estado DRAFT
      if (invoice.status !== InvoiceStatus.DRAFT) {
        throw new BusinessException(
          'Invoice is not in a modifiable state',
          'INVOICE_NOT_MODIFIABLE',
        );
      }

      // Actualizar clientId si se proporciona
      if (clientId !== undefined) {
        invoice.clientId = clientId;
      }

      // Actualizar items si se proporcionan
      if (items && items.length > 0) {
        // Limpiar detalles existentes
        invoice.clearDetails();

        // Validar productos duplicados
        const productIds = items.map((i) => i.productId);
        const uniqueProductIds = new Set(productIds);
        if (uniqueProductIds.size !== productIds.length) {
          throw new BusinessException(
            'Duplicate products found in invoice details',
            'DUPLICATE_PRODUCTS',
          );
        }

        // Procesar cada item
        for (const item of items) {
          const productData = await this.productRepository.findById(
            item.productId,
          );
          if (!productData) {
            throw new NotFoundException(
              `Product with ID ${item.productId} not found`,
            );
          }

          const unitPrice = item.unitPrice ?? Number(productData.price);
          const detail = new InvoiceDetail(
            productData.id,
            item.quantity,
            unitPrice,
          );
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
      }

      // Los snapshots se recalculan automáticamente a través de los getters
      // ya que clearDetails() y addDetail() actualizan this.details

      return this.invoiceRepository.update(id, invoice);
    });
  }
}
