import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const ds = new DataSource({
    type: 'oracle',
    connectString: process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  
  const admin = await ds.query(`
    SELECT u.ID, u.EMAIL, r.NAME as ROLE_NAME 
    FROM USERS u 
    LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID 
    LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID 
    WHERE u.EMAIL = 'admin@gentleman.com'`);
  console.log('Admin user:', JSON.stringify(admin));

  const roles = await ds.query(`SELECT ID, NAME FROM ROLES WHERE NAME IN ('ADMINISTRATOR', 'SELLER', 'MANAGER', 'VIEWER') ORDER BY ID`);
  console.log('Sample roles:', JSON.stringify(roles));
  
  await ds.destroy();
}
check().catch(console.error);