import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInvoiceCommand } from '../commands/create-invoice.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/invoices/repositories/invoice.repository.interface';
import { IClientRepository } from '../../../domain/clients/repositories/client.repository.interface';
import { IProductRepository } from '../../../domain/products/repositories/product.repository.interface';
import { ITaxRepository } from '../../../domain/taxes/repositories/tax.repository.interface';
import { Invoice } from '../../../domain/invoices/entities/invoice.entity';
import { InvoiceDetail } from '../../../domain/invoices/entities/invoice-detail.entity';
import { InvoiceDetailTax } from '../../../domain/invoices/entities/invoice-detail-tax.entity';

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
    const { clientId, items } = command;

    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    let subtotalSnapshot = 0;
    let taxTotalSnapshot = 0;
    const invoiceDetails: InvoiceDetail[] = [];

    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      const detail = new InvoiceDetail();
      detail.productId = product.id;
      detail.quantity = item.quantity;
      detail.unitPriceSnapshot = Number(product.price);
      detail.detailTaxes = [];

      const itemSubtotal = detail.unitPriceSnapshot * detail.quantity;
      subtotalSnapshot += itemSubtotal;

      for (const taxId of item.impuestoIds) {
        const tax = await this.taxRepository.findById(taxId);
        if (!tax) {
          throw new NotFoundException(`Tax with ID ${taxId} not found`);
        }

        const detailTax = new InvoiceDetailTax();
        detailTax.taxId = tax.id;
        detailTax.rateSnapshot = Number(tax.currentRate);
        detailTax.calculatedAmountSnapshot =
          itemSubtotal * (detailTax.rateSnapshot / 100);

        detail.detailTaxes.push(detailTax);
        taxTotalSnapshot += detailTax.calculatedAmountSnapshot;
      }

      invoiceDetails.push(detail);
    }

    const invoice = new Invoice();
    invoice.clientId = clientId;
    invoice.subtotalSnapshot = subtotalSnapshot;
    invoice.taxTotalSnapshot = taxTotalSnapshot;
    invoice.totalSnapshot = subtotalSnapshot + taxTotalSnapshot;
    invoice.details = invoiceDetails;
    invoice.transactionId = `TRX-${Date.now()}`; 

    return this.invoiceRepository.create(invoice);
  }
}
