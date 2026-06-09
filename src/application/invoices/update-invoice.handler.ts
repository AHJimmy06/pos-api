import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateInvoiceCommand } from './update-invoice.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { ITaxRepository } from '../common/interfaces/tax.repository.interface';
import { IClientRepository } from '../common/interfaces/client.repository.interface';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import { IStockMovementRepository } from '../common/interfaces/stock-movement.repository.interface';
import { IUnitOfWork } from '../common/interfaces/unit-of-work.interface';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../domain/entities/invoice-detail.entity';
import { StockMovement } from '../../domain/entities/stock-movement.entity';
import { BusinessException } from '../../domain/exceptions/business.exception';
import { InvoiceStatus } from '../../domain/enums/invoice-status.enum';
import { MovementType } from '../../domain/enums/movement-type.enum';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(UpdateInvoiceCommand)
export class UpdateInvoiceHandler implements ICommandHandler<UpdateInvoiceCommand> {
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(TOKENS.TAX_REPOSITORY)
    private readonly taxRepository: ITaxRepository,
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKENS.STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
    @Inject(TOKENS.UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: UpdateInvoiceCommand): Promise<Invoice> {
    return this.uow.runInTransaction(async () => {
      const { id, clientId, items, userId } = command;

      const oldInvoice = await this.invoiceRepository.findByIdWithDetails(id);
      if (!oldInvoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      // Validar que la factura no esté ya cancelada
      if (oldInvoice.status === InvoiceStatus.CANCELLED) {
        throw new BusinessException(
          'Cannot modify a cancelled invoice',
          'INVOICE_ALREADY_CANCELLED',
        );
      }

      // 1. Restaurar stock de la factura vieja si estaba CONFIRMADA
      if (oldInvoice.status === InvoiceStatus.CONFIRMED) {
        for (const detail of oldInvoice.details) {
          const product = await this.productRepository.findById(
            detail.productId,
          );
          if (product) {
            await this.productRepository.addStock({
              productId: detail.productId,
              quantity: detail.quantity,
              expectedVersion: product.version,
            });

            await this.stockMovementRepository.create(
              new StockMovement({
                productId: detail.productId,
                type: MovementType.ENTRY,
                quantity: detail.quantity,
                previousStock: product.stock,
                newStock: product.stock + detail.quantity,
                userId: userId,
                reference: `Revisión de factura #${oldInvoice.id} - Anulación de stock previo`,
              }),
            );
          }
        }
      }

      // 2. Cancelar la factura vieja
      oldInvoice.status = InvoiceStatus.CANCELLED;
      oldInvoice.isActive = false;
      await this.invoiceRepository.update(oldInvoice.id!, oldInvoice);

      // 3. Crear la NUEVA factura (revisión)
      const finalClientId = clientId ?? oldInvoice.clientId;
      const client = await this.clientRepository.findById(finalClientId);
      if (!client) {
        throw new NotFoundException(
          `Client with ID ${finalClientId} not found`,
        );
      }

      const seller = userId ? await this.userRepository.findById(userId) : null;

      const newInvoice = new Invoice(finalClientId);
      newInvoice.userId = userId;
      newInvoice.status = InvoiceStatus.CONFIRMED; // La nueva se crea confirmada por defecto si es una modificación
      newInvoice.paymentMethod = oldInvoice.paymentMethod;

      // Snapshots
      newInvoice.clientNameSnapshot = `${client.firstName} ${client.lastName}`;
      newInvoice.clientEmailSnapshot = client.email;
      if (seller) {
        newInvoice.sellerNameSnapshot = `${seller.name} ${seller.lastName}`;
      }

      // Procesar items para la nueva factura
      const itemsToProcess =
        items && items.length > 0
          ? items
          : oldInvoice.details.map((d) => ({
              productId: d.productId,
              quantity: d.quantity,
              unitPrice: d.unitPriceSnapshot,
              productName: d.productName,
            }));

      // Validar productos duplicados
      const productIds = itemsToProcess.map((i) => i.productId);
      const uniqueProductIds = new Set(productIds);
      if (uniqueProductIds.size !== productIds.length) {
        throw new BusinessException(
          'Duplicate products found in invoice details',
          'DUPLICATE_PRODUCTS',
        );
      }

      // Fetch batch de productos e impuestos
      const productsData = await this.productRepository.findByIds(
        Array.from(uniqueProductIds) as number[],
      );
      const productMap = new Map(productsData.map((p) => [p.id, p]));

      // Procesar cada item
      for (const item of itemsToProcess) {
        const productData = productMap.get(item.productId);
        if (!productData) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        // Reducir stock para la nueva factura
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
            `Error de concurrencia para producto ${item.productId}. Reintente.`,
          );
        }

        // Registrar movimiento de stock
        await this.stockMovementRepository.create(
          new StockMovement({
            productId: item.productId,
            type: MovementType.EXIT,
            quantity: item.quantity,
            previousStock: productData.stock,
            newStock: productData.stock - item.quantity,
            userId: userId,
            reference: `Modificación de factura #${oldInvoice.id} -> Nueva factura #${newInvoice.transactionId}`,
          }),
        );

        const detail = new InvoiceDetail(
          productData.id,
          item.quantity,
          item.unitPrice ?? Number(productData.price),
        );
        detail.productName = item.productName || productData.name;

        // Copiar o agregar impuestos (simplificado: re-asigna desde producto si no se proveen)
        // En una implementación real, podrías querer copiar los taxes del snapshot original o buscar los actuales.
        // Aquí buscaremos los actuales por simplicidad.
        // Only user-provided items carry tax IDs; the snapshot fallback path doesn't.
        const taxIds: number[] =
          'impuestoIds' in item ? (item.impuestoIds ?? []) : [];
        if (taxIds.length > 0) {
          const taxes = await this.taxRepository.findByIds(taxIds);
          taxes.forEach((t) => detail.addTax(t.id, Number(t.currentRate)));
        }

        newInvoice.addDetail(detail);
      }

      return this.invoiceRepository.create(newInvoice);
    });
  }
}
