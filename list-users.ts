import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const ds = new DataSource({
    type: 'oracle',
    connectString: process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: false,
    logging: false,
  });
  await ds.initialize();
  
  const users = await ds.query(`
    SELECT u.ID, u.USERNAME, u.EMAIL, u.NAME, u.LAST_NAME, u.IS_ACTIVE, 
           LISTAGG(r.NAME, ', ') WITHIN GROUP (ORDER BY r.NAME) AS ROLES
    FROM USERS u
    LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
    LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
    GROUP BY u.ID, u.USERNAME, u.EMAIL, u.NAME, u.LAST_NAME, u.IS_ACTIVE
    ORDER BY u.ID
    FETCH NEXT 20 ROWS ONLY
  `);
  
  console.log('\n📋 PRIMEROS 20 USUARIOS:');
  console.log('─'.repeat(90));
  console.log('ID'.padEnd(8) + 'USERNAME'.padEnd(15) + 'EMAIL'.padEnd(30) + 'NOMBRE'.padEnd(20) + 'ROLES');
  console.log('─'.repeat(90));
  
  for (const u of users) {
    const roles = u.ROLES || '(sin rol)';
    console.log(
      String(u.ID).padEnd(8) + 
      u.USERNAME.padEnd(15) + 
      u.EMAIL.padEnd(30) + 
      (u.NAME + ' ' + u.LAST_NAME).padEnd(20).slice(0,20) + 
      roles
    );
  }
  
  const count = await ds.query('SELECT COUNT(*) as C FROM USERS');
  console.log('─'.repeat(90));
  console.log('TOTAL: ' + count[0].C + ' usuarios');
  
  await ds.destroy();
}
main().catch(console.error);
