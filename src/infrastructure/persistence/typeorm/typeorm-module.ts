import { Module, Global } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmUnitOfWork } from './typeorm-unit-of-work';
import { TOKENS } from '../../../application/common/tokens/tokens';

// Entities
import { ClientEntity } from './entities/client.entity';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { BlockedUserEntity } from './entities/blocked-user.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductTaxEntity } from './entities/product-tax.entity';
import { TaxEntity } from './entities/tax.entity';
import { InvoiceEntity } from './entities/invoice.entity';
import { InvoiceDetailEntity } from './entities/invoice-detail.entity';
import { StockMovementEntity } from './entities/stock-movement.entity';
import { ErrorLogEntity } from './entities/error-log.entity';

// Repositories
import { TypeOrmClientRepository } from './repositories/client.repository';
import { TypeOrmUserRepository } from './repositories/user.repository';
import { TypeOrmRoleRepository } from './repositories/role.repository';
import { TypeOrmBlockedUserRepository } from './repositories/blocked-user.repository';
import { TypeOrmProductRepository } from './repositories/product.repository';
import { TypeOrmTaxRepository } from './repositories/tax.repository';
import { TypeOrmInvoiceRepository } from './repositories/invoice.repository';
import { TypeOrmStockMovementRepository } from './repositories/stock-movement.repository';
import { TypeOrmErrorLogRepository } from './repositories/error-log.repository';

const ENTITIES = [
  ClientEntity,
  UserEntity,
  RoleEntity,
  UserRoleEntity,
  BlockedUserEntity,
  ProductEntity,
  ProductTaxEntity,
  TaxEntity,
  InvoiceEntity,
  InvoiceDetailEntity,
  StockMovementEntity,
  ErrorLogEntity,
];

let dataSourceInstance: DataSource | null = null;

async function createDataSource(): Promise<DataSource> {
  if (dataSourceInstance?.isInitialized) {
    return dataSourceInstance;
  }

  const dataSource = new DataSource({
    type: 'oracle',
    connectString: `${process.env.DB_HOST || 'oracle-db-server.mshome.net'}:${process.env.DB_PORT || '1521'}/${process.env.DB_DATABASE || 'ORCLPDB1'}`,
    username: process.env.DB_USERNAME || 'nest_user',
    password: process.env.DB_PASSWORD || 'nest_user',
    extra: {
      poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
      poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
    entities: ENTITIES,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
  });

  await dataSource.initialize();
  dataSourceInstance = dataSource;
  return dataSource;
}

@Global()
@Module({
  providers: [
    // 1. DataSource factory (async initialization)
    {
      provide: DataSource,
      useFactory: async () => {
        console.log('Initializing Oracle DataSource...');
        const ds = await createDataSource();
        console.log('Oracle DataSource initialized');
        return ds;
      },
    },
    // 2. UnitOfWork (depends on DataSource)
    {
      provide: TOKENS.UNIT_OF_WORK,
      useClass: TypeOrmUnitOfWork,
    },
    // 3. All repositories via token mapping
    {
      provide: TOKENS.CLIENT_REPOSITORY,
      useClass: TypeOrmClientRepository,
    },
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: TOKENS.ROLE_REPOSITORY,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: TOKENS.BLOCKED_USER_REPOSITORY,
      useClass: TypeOrmBlockedUserRepository,
    },
    {
      provide: TOKENS.PRODUCT_REPOSITORY,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: TOKENS.TAX_REPOSITORY,
      useClass: TypeOrmTaxRepository,
    },
    {
      provide: TOKENS.INVOICE_REPOSITORY,
      useClass: TypeOrmInvoiceRepository,
    },
    {
      provide: TOKENS.STOCK_MOVEMENT_REPOSITORY,
      useClass: TypeOrmStockMovementRepository,
    },
    {
      provide: TOKENS.ERROR_LOG_REPOSITORY,
      useClass: TypeOrmErrorLogRepository,
    },
  ],
  exports: [
    DataSource,
    TOKENS.UNIT_OF_WORK,
    TOKENS.CLIENT_REPOSITORY,
    TOKENS.USER_REPOSITORY,
    TOKENS.ROLE_REPOSITORY,
    TOKENS.BLOCKED_USER_REPOSITORY,
    TOKENS.PRODUCT_REPOSITORY,
    TOKENS.TAX_REPOSITORY,
    TOKENS.INVOICE_REPOSITORY,
    TOKENS.STOCK_MOVEMENT_REPOSITORY,
    TOKENS.ERROR_LOG_REPOSITORY,
  ],
})
export class TypeOrmModule {}
