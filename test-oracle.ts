// Script de prueba de conexión Oracle
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('📡 Probando conexión a Oracle...\n');
  console.log('Configuración:');
  console.log('  HOST:', process.env.DB_HOST || 'localhost');
  console.log('  PORT:', process.env.DB_PORT || '1521');
  console.log('  DATABASE:', process.env.DB_DATABASE || 'ORCLPDB1');
  console.log('  USER:', process.env.DB_USERNAME || 'nest_user');
  console.log('');

  const ds = new DataSource({
    type: 'oracle',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1521', 10),
    database: process.env.DB_DATABASE || 'ORCLPDB1',
    username: process.env.DB_USERNAME || 'nest_user',
    password: process.env.DB_PASSWORD || 'nest_user',
    synchronize: false,
    logging: false,
    connectString: `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '1521'}/${process.env.DB_DATABASE || 'ORCLPDB1'}`,
  });

  try {
    console.log('⏳ Conectando...');
    await ds.initialize();
    console.log('✅ Conexión exitosa!\n');

    // Verificar tablas existentes
    console.log('📊 Tablas existentes:');
    const tables = ['USERS', 'PRODUCTS', 'CLIENTS', 'INVOICES', 'ROLES'];
    for (const table of tables) {
      try {
        const result = await ds.query(`SELECT COUNT(*) as CNT FROM ${table}`);
        console.log(`  ${table}: ${result[0]?.CNT || 0} registros`);
      } catch (e: any) {
        console.log(`  ${table}: ❌ No existe o error - ${e.message.substring(0, 50)}`);
      }
    }

    await ds.destroy();
    console.log('\n🔌 Desconectado');
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    console.error('\nPosibles causas:');
    console.error('  - Oracle no está corriendo');
    console.error('  - Firewall bloqueando el puerto 1521');
    console.error('  - Credenciales incorrectas');
    process.exit(1);
  }
}

testConnection();