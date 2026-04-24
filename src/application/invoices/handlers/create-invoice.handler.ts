import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInvoiceCommand } from '../commands/create-invoice.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';
import { IClientRepository } from '../../../domain/repositories/client.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ITaxRepository } from '../../../domain/repositories/tax.repository.interface';
import { Invoice } from '../../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../../domain/entities/invoice-detail.entity';

import { Product } from '../../../domain/entities/product.entity';

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

    const invoice = new Invoice(clientId);

    for (const item of items) {
      const productData = await this.productRepository.findById(item.productId);
      if (!productData) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Rehidratamos la entidad de producto para aplicar lógica de negocio
      const product = new Product(
        productData.name,
        Number(productData.price),
        productData.stock,
      );
      product.id = productData.id;

      // Intentamos reducir el stock (lanzará BusinessException si no hay suficiente)
      product.reduceStock(item.quantity);

      // Actualizamos el stock en el repositorio
      await this.productRepository.update(product.id, { stock: product.stock });

      const detail = new InvoiceDetail(
        product.id,
        item.quantity,
        product.price,
      );

      for (const taxId of item.impuestoIds) {
        const tax = await this.taxRepository.findById(taxId);
        if (!tax) {
          throw new NotFoundException(`Tax with ID ${taxId} not found`);
        }
        detail.addTax(tax.id, Number(tax.currentRate));
      }

      invoice.addDetail(detail);
    }

    return this.invoiceRepository.create(invoice);
  }
}
