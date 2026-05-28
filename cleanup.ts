// Limpiar todas las tablas de Oracle
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function truncateAll() {
  console.log('🧹 Limpiando tablas de Oracle...\n');

  const ds = new DataSource({
    type: 'oracle',
    connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: false,
    logging: false,
  });

  await ds.initialize();

  // Orden por dependencias (las que tienen FK primero)
  const tables = [
    { name: 'INVOICE_DETAIL_TAXES', order: 1 },
    { name: 'INVOICE_DETAILS', order: 2 },
    { name: 'STOCK_MOVEMENTS', order: 3 },
    { name: 'PRODUCT_TAXES', order: 4 },
    { name: 'INVOICES', order: 5 },
    { name: 'USER_ROLES', order: 6 },
    { name: 'BLOCKED_USERS', order: 7 },
    { name: 'USERS', order: 8 },
    { name: 'PRODUCTS', order: 9 },
    { name: 'CLIENTS', order: 10 },
    { name: 'ROLES', order: 11 },
    { name: 'TAXES', order: 12 },
  ];

  for (const { name } of tables.sort((a, b) => a.order - b.order)) {
    try {
      const result = await ds.query(`DELETE FROM ${name}`);
      console.log(`✅ ${name} - limpiada`);
    } catch (e: any) {
      console.log(`❌ ${name} - ${e.message.substring(0, 80)}`);
    }
  }

  // Reiniciar secuencias
  const sequences = [
    'USERS_SEQ',
    'PRODUCTS_SEQ', 
    'CLIENTS_SEQ',
    'INVOICES_SEQ',
    'ROLES_SEQ',
    'TAXES_SEQ',
  ];

  console.log('\n🔄 Reiniciando secuencias...');
  for (const seq of sequences) {
    try {
      await ds.query(`DROP SEQUENCE ${seq}`);
      await ds.query(`CREATE SEQUENCE ${seq} START WITH 1 INCREMENT BY 1`);
      console.log(`✅ ${seq} reiniciada`);
    } catch (e: any) {
      console.log(`ℹ️  ${seq} - ${e.message.substring(0, 60)}`);
    }
  }

  await ds.destroy();
  console.log('\n✨ Limpieza completa!');
}

truncateAll().catch(console.error);