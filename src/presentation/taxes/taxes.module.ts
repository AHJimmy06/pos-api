import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TaxesController } from '../web/controllers/taxes.controller';
import { CreateTaxHandler } from '../../application/taxes/create-tax.handler';
import { DeleteTaxHandler } from '../../application/taxes/delete-tax.handler';
import { GetTaxHandler } from '../../application/taxes/get-tax.handler';
import { GetTaxesHandler } from '../../application/taxes/get-taxes.handler';
import { UpdateTaxHandler } from '../../application/taxes/update-tax.handler';
import { TypeOrmTaxRepository } from '../../infrastructure/persistence/typeorm/repositories/tax.repository';
import { TypeOrmModule } from '../../infrastructure/persistence/typeorm/typeorm-module';
import { TOKENS } from '../../application/common/tokens/tokens';

const TaxHandlers = [
  CreateTaxHandler,
  DeleteTaxHandler,
  GetTaxHandler,
  GetTaxesHandler,
  UpdateTaxHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule],
  controllers: [TaxesController],
  providers: [
    ...TaxHandlers,
    {
      provide: TOKENS.TAX_REPOSITORY,
      useClass: TypeOrmTaxRepository,
    },
  ],
  exports: [TOKENS.TAX_REPOSITORY],
})
export class TaxesModule {}
