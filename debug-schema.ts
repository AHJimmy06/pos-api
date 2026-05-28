// Debug schema y counts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const ds = new DataSource({
    type: 'oracle',
    connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: false,
    logging: false,
  });

  await ds.initialize();

  const tables = ['USERS', 'CLIENTS', 'PRODUCTS'];
  for (const table of tables) {
    const cols = await ds.query(`SELECT COLUMN_NAME FROM USER_TAB_COLUMNS WHERE TABLE_NAME = '${table}'`);
    const count = await ds.query(`SELECT COUNT(*) as C, MAX(ID) as MX FROM ${table}`);
    console.log(`${table}: cols=[${cols.map((c: any) => c.COLUMN_NAME).join(',')}], count=${count[0].C}, maxId=${count[0].MX}`);
  }

  // Test foreign key constraint
  const userExists = await ds.query('SELECT 1 FROM USERS WHERE ID = :1', [15052]);
  console.log('User 15052 exists:', userExists.length > 0);

  await ds.destroy();
}

check().catch(console.error);