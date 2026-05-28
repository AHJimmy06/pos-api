// Verificar schema de Oracle
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
  const ds = new DataSource({
    type: 'oracle',
    connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: false,
    logging: false,
  });

  await ds.initialize();

  const tables = ['TAXES', 'PRODUCTS', 'ROLES'];
  for (const table of tables) {
    const cols = await ds.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = '${table}'`);
    console.log(`\n${table}:`, cols.map((c: any) => c.COLUMN_NAME).join(', '));
  }

  await ds.destroy();
}

checkSchema().catch(console.error);