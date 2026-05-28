import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function fix() {
  const ds = new DataSource({
    type: 'oracle',
    connectString: process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  
  const admin = await ds.query("SELECT ID FROM USERS WHERE EMAIL = 'admin@gentleman.com'");
  if (admin.length === 0) { console.log('Admin no encontrado'); await ds.destroy(); return; }
  const adminId = admin[0].ID;
  console.log('Admin ID:', adminId);

  const adminRole = await ds.query("SELECT ID FROM ROLES WHERE NAME = 'ADMINISTRATOR'");
  if (adminRole.length === 0) { console.log('Rol ADMINISTRATOR no encontrado'); await ds.destroy(); return; }
  const roleId = adminRole[0].ID;
  console.log('ADMINISTRATOR role ID:', roleId);

  try {
    await ds.query('INSERT INTO USER_ROLES (USER_ID, ROLE_ID) VALUES (:1, :2)', [adminId, roleId]);
    console.log('✅ Rol ADMINISTRATOR asignado al admin');
  } catch (e) {
    console.log('Error:', e);
  }
  
  await ds.destroy();
}
fix().catch(console.error);