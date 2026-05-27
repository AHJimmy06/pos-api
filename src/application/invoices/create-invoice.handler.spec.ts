import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceHandler } from './create-invoice.handler';
import { CreateInvoiceCommand } from './create-invoice.command';
import { TOKENS } from '../common/tokens/tokens';
import { InvoiceStatus } from '../../domain/enums/invoice-status.enum';

describe('CreateInvoiceHandler (Optimization Verification)', () => {
  let handler: CreateInvoiceHandler;
  let productRepo: any;
  let taxRepo: any;
  let clientRepo: any;
  let uow: any;

  beforeEach(async () => {
    productRepo = {
      findByIds: jest.fn().mockResolvedValue([
        { id: 1, name: 'P1', price: 10, stock: 100, version: 0, taxIds: [] },
        { id: 2, name: 'P2', price: 20, stock: 100, version: 0, taxIds: [] },
      ]),
      reduceStock: jest.fn().mockResolvedValue(true),
    };
    taxRepo = {
      findByIds: jest.fn().mockResolvedValue([]),
    };
    clientRepo = {
      findById: jest.fn().mockResolvedValue({ id: 1 }),
    };
    uow = {
      runInTransaction: jest.fn((cb: () => any) => cb()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvoiceHandler,
        { provide: TOKENS.PRODUCT_REPOSITORY, useValue: productRepo },
        { provide: TOKENS.TAX_REPOSITORY, useValue: taxRepo },
        { provide: TOKENS.CLIENT_REPOSITORY, useValue: clientRepo },
        {
          provide: TOKENS.INVOICE_REPOSITORY,
          useValue: { create: jest.fn((i) => i) },
        },
        {
          provide: TOKENS.STOCK_MOVEMENT_REPOSITORY,
          useValue: { create: jest.fn() },
        },
        { provide: TOKENS.UNIT_OF_WORK, useValue: uow },
      ],
    }).compile();

    handler = module.get<CreateInvoiceHandler>(CreateInvoiceHandler);
  });

  it('should call productRepository.findByIds exactly ONCE for multiple items (Batching Verification)', async () => {
    const command = new CreateInvoiceCommand(
      1,
      [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
      InvoiceStatus.CONFIRMED,
      1,
    );

    await handler.execute(command);

    // Verify batching
    expect(productRepo.findByIds).toHaveBeenCalledTimes(1);
    expect(productRepo.findByIds).toHaveBeenCalledWith(
      expect.arrayContaining([1, 2]),
    );
  });
});
