import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeInvoiceStatusCommand } from './change-invoice-status.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { IStockMovementRepository } from '../common/interfaces/stock-movement.repository.interface';
import { IUnitOfWork } from '../common/interfaces/unit-of-work.interface';
import { StockMovement } from '../../domain/entities/stock-movement.entity';
import { BusinessException } from '../../domain/exceptions/business.exception';
import { InvoiceStatus } from '../../domain/enums/invoice-status.enum';
import { MovementType } from '../../domain/enums/movement-type.enum';
import type { ChangeInvoiceStatusResult } from '../../domain/interfaces/change-invoice-status-result.interface';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(ChangeInvoiceStatusCommand)
export class ChangeInvoiceStatusHandler implements ICommandHandler<ChangeInvoiceStatusCommand> {
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(TOKENS.STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
    @Inject(TOKENS.UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: ChangeInvoiceStatusCommand,
  ): Promise<ChangeInvoiceStatusResult> {
    return this.uow.runInTransaction(async () => {
      const { id, status, userId } = command;

      const invoice = await this.invoiceRepository.findByIdWithDetails(id);
      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      const originalStatus = invoice.status;

      // Validar transiciones de estado
      if (originalStatus === InvoiceStatus.CANCELLED) {
        throw new BusinessException(
          'Cannot change status of a cancelled invoice',
          'INVALID_STATUS_TRANSITION',
        );
      }

      if (status === InvoiceStatus.DRAFT) {
        throw new BusinessException(
          'Invalid status transition',
          'INVALID_STATUS_TRANSITION',
        );
      }

      if (
        status === InvoiceStatus.CANCELLED &&
        originalStatus !== InvoiceStatus.CONFIRMED
      ) {
        throw new BusinessException(
          'Only CONFIRMED invoices can be cancelled',
          'INVALID_STATUS_TRANSITION',
        );
      }

      // Admin-only authorization for cancellation
      if (status === InvoiceStatus.CANCELLED) {
        if (command.userRole !== 'ADMINISTRATOR') {
          throw new BusinessException(
            'Only administrators can cancel invoices',
            'UNAUTHORIZED_ACTION',
          );
        }
      }

      const stockMovements: StockMovement[] = [];

      // Manejar transición DRAFT -> CONFIRMED
      if (
        originalStatus === InvoiceStatus.DRAFT &&
        status === InvoiceStatus.CONFIRMED
      ) {
        // Verificar stock para cada item
        for (const detail of invoice.details) {
          const product = await this.productRepository.findById(
            detail.productId,
          );
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${detail.productId} not found`,
            );
          }

          if (product.stock < detail.quantity) {
            throw new BusinessException(
              `Stock insuficiente para producto ${detail.productId}. Disponible: ${product.stock}, solicitado: ${detail.quantity}`,
              'INSUFFICIENT_STOCK',
            );
          }

          // Reducir stock
          const success = await this.productRepository.reduceStock({
            productId: detail.productId,
            quantity: detail.quantity,
            expectedVersion: product.version,
          });

          if (!success) {
            throw new BusinessException(
              `Error de concurrencia para producto ${detail.productId}. Reintente.`,
              'STOCK_CONFLICT',
            );
          }

          // Crear movimiento de stock (EXIT)
          const movement = new StockMovement({
            productId: detail.productId,
            type: MovementType.EXIT,
            quantity: detail.quantity,
            previousStock: product.stock,
            newStock: product.stock - detail.quantity,
            userId: userId,
            reference: `Confirmación de factura #${invoice.id}`,
          });

          await this.stockMovementRepository.create(movement);
          stockMovements.push(movement);
        }
      }

      // Manejar transición CONFIRMED -> CANCELLED
      if (
        originalStatus === InvoiceStatus.CONFIRMED &&
        status === InvoiceStatus.CANCELLED
      ) {
        // Restaurar stock para cada item
        for (const detail of invoice.details) {
          const product = await this.productRepository.findById(
            detail.productId,
          );
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${detail.productId} not found`,
            );
          }

          // Restaurar stock
          const success = await this.productRepository.addStock({
            productId: detail.productId,
            quantity: detail.quantity,
            expectedVersion: product.version,
          });

          if (!success) {
            throw new BusinessException(
              `Error de concurrencia para producto ${detail.productId}. Reintente.`,
              'STOCK_CONFLICT',
            );
          }

          // Crear movimiento de stock (ENTRY)
          const movement = new StockMovement({
            productId: detail.productId,
            type: MovementType.ENTRY,
            quantity: detail.quantity,
            previousStock: product.stock,
            newStock: product.stock + detail.quantity,
            userId: userId,
            reference: `Cancelación de factura #${invoice.id}`,
          });

          await this.stockMovementRepository.create(movement);
          stockMovements.push(movement);
        }

        // Marcar la factura como inactiva
        invoice.isActive = false;
      }

      // Actualizar estado de la factura
      invoice.status = status;
      const updatedInvoice = await this.invoiceRepository.update(id, invoice);

      return {
        invoice: updatedInvoice,
        stockMovements,
      };
    });
  }
}
