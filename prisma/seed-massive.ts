/**
 * SEMILLERO MASIVO - pos-api
 * Genera 100k registros en cada tabla para testing de rendimiento Oracle
 * Usa INSERT individual para evitar problemas con bind positions
 * 
 * Uso: cd pos-api && npx tsx prisma/seed-massive.ts
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { randomBytes } from 'node:crypto';

dotenv.config();

const BATCH_COMMIT = 1000; // Commit cada 1000 registros
const TARGET = 100_000;

const ds = new DataSource({
  type: 'oracle',
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  logging: false,
});

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const padNum = (n: number, len: number) => String(n).padStart(len, '0');

const NAMES = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Luis', 'Carmen', 'Jorge', 'Diana',
  'Miguel', 'Sofia', 'Andrés', 'Valentina', 'Fernando', 'Carolina', 'Diego', 'Paula', 'Alejandro', 'Camila'];
const LAST_NAMES = ['González', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez',
  'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz', 'Ortega', 'Castillo', 'Vargas', 'García'];
const ADJECTIVES = ['Premium', 'Básico', 'Plus', 'Ultra', 'Standard', 'Professional', 'Elite', 'Classic', 'Modern', 'Eco'];
const PRODUCTS_BASE = ['Lápiz', 'Cuaderno', 'Borrador', 'Sacapuntas', 'Regla', 'Tijeras', 'Pegamento', 'Cartulina',
  'Papel', 'Carpeta', 'Clips', 'Grapadora', 'Perforadora', 'Resma', 'Bolígrafo', 'Marcador', 'Bloc', 'Agenda'];
const STREETS = ['Calle', 'Carrera', 'Avenida', 'Diagonal', 'Transversal'];
const STATUSES = ['CONFIRMED', 'DRAFT', 'CANCELLED'];
const PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER'];

function progress(current: number, total: number, startTime: number): void {
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = Math.round(current / elapsed);
  process.stdout.write(`\r  ${current.toLocaleString()} / ${total.toLocaleString()} (${rate}/s)`);
}

async function seedRoles(): Promise<Map<string, number>> {
  console.log('\n🎭 [1/8] Semillero de ROLES...');
  const start = Date.now();

  await ds.query('DELETE FROM ROLES');

  const roleMap = new Map<string, number>();
  
  const baseRoles = ['ADMINISTRATOR', 'SELLER', 'MANAGER', 'VIEWER'];
  for (const name of baseRoles) {
    await ds.query(`INSERT INTO ROLES (NAME, DESCRIPTION) VALUES (:1, :2)`, [name, `Rol ${name}`]);
  }
  
  for (let i = 5; i <= 100; i++) {
    await ds.query(`INSERT INTO ROLES (NAME, DESCRIPTION) VALUES (:1, :2)`, [`ROLE_${padNum(i, 3)}`, `Descripción rol ${i}`]);
  }

  const result = await ds.query('SELECT ID, NAME FROM ROLES');
  result.forEach((r: any) => roleMap.set(r.NAME, r.ID));

  console.log(`\n✅ ${result.length} roles (${((Date.now() - start) / 1000).toFixed(1)}s)`);
  return roleMap;
}

async function seedUsers(): Promise<number> {
  console.log('\n👤 [2/8] Semillero de USERS (100k)...');
  const start = Date.now();
  const passwordHash = await bcrypt.hash('Gentleman2026!', 10);

  const existingAdmin = await ds.query('SELECT COUNT(*) as C FROM USERS WHERE USERNAME = :1', ['admin']);
  if (existingAdmin[0].C === 0) {
    await ds.query(
      `INSERT INTO USERS (USERNAME, NAME, LAST_NAME, CEDULA, EMAIL, PASSWORD, IS_ACTIVE) VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      ['admin', 'Admin', 'System', '1000000000', 'admin@gentleman.com', passwordHash, 1]
    );
    console.log('  Admin creado');
  } else {
    console.log('  Admin ya existe');
  }

  let inserted = 1;
  let commitCount = 0;
  
  while (inserted < TARGET) {
    const idx = inserted;
    await ds.query(
      `INSERT INTO USERS (USERNAME, NAME, LAST_NAME, CEDULA, EMAIL, PASSWORD, IS_ACTIVE) VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [`user${idx}`, pick(NAMES), pick(LAST_NAMES), `CC${padNum(randInt(1, 99999999), 8)}`, `user${idx}@gentleman.com`, passwordHash, 1]
    );
    
    inserted++;
    commitCount++;
    
    if (commitCount >= BATCH_COMMIT) {
      await ds.query('COMMIT');
      commitCount = 0;
      progress(inserted, TARGET, start);
    }
  }
  await ds.query('COMMIT');

  const count = await ds.query('SELECT COUNT(*) as C FROM USERS');
  console.log(`\n✅ ${count[0].C.toLocaleString()} usuarios (${((Date.now() - start) / 1000).toFixed(1)}s)`);
  return count[0].C;
}

async function seedTaxes(): Promise<void> {
  console.log('\n💰 [3/8] Semillero de TAXES (100k)...');
  const start = Date.now();

  await ds.query('DELETE FROM TAXES');

  let i = 1;
  let commitCount = 0;
  while (i <= TARGET) {
    await ds.query(`INSERT INTO TAXES (NAME, CURRENT_RATE) VALUES (:1, :2)`, [`TAX_${padNum(i, 3)}`, Math.random() * 30]);
    i++;
    commitCount++;
    if (commitCount >= BATCH_COMMIT) {
      await ds.query('COMMIT');
      commitCount = 0;
      progress(i, TARGET, start);
    }
  }
  await ds.query('COMMIT');

  const count = await ds.query('SELECT COUNT(*) as C FROM TAXES');
  console.log(`\n✅ ${count[0].C.toLocaleString()} impuestos (${((Date.now() - start) / 1000).toFixed(1)}s)`);
}

async function seedProducts(): Promise<number> {
  console.log('\n📦 [4/8] Semillero de PRODUCTS (100k)...');
  const start = Date.now();

  let inserted = 0;
  let commitCount = 0;
  const usedNames = new Set<string>();

  while (inserted < TARGET) {
    let name = `${pick(ADJECTIVES)} ${pick(PRODUCTS_BASE)} #${padNum(inserted + 1, 6)}`;
    let attempt = 0;
    while (usedNames.has(name) && attempt < 10) {
      name = `${pick(ADJECTIVES)} ${pick(PRODUCTS_BASE)} ${padNum(inserted + 1 + randInt(0, 9999), 6)}`;
      attempt++;
    }
    usedNames.add(name);

    await ds.query(
      `INSERT INTO PRODUCTS (NAME, PRICE, STOCK, VERSION, IS_ACTIVE) VALUES (:1, :2, :3, :4, :5)`,
      [name, Math.random() * 99000 + 1000, randInt(0, 500), 0, 1]
    );

    inserted++;
    commitCount++;
    if (commitCount >= BATCH_COMMIT) {
      await ds.query('COMMIT');
      commitCount = 0;
      progress(inserted, TARGET, start);
    }
  }
  await ds.query('COMMIT');

  const count = await ds.query('SELECT COUNT(*) as C FROM PRODUCTS');
  console.log(`\n✅ ${count[0].C.toLocaleString()} productos (${((Date.now() - start) / 1000).toFixed(1)}s)`);
  return count[0].C;
}

async function seedClients(): Promise<number> {
  console.log('\n👥 [5/8] Semillero de CLIENTS (100k)...');
  const start = Date.now();

  let inserted = 0;
  let commitCount = 0;
  
  while (inserted < TARGET) {
    await ds.query(
      `INSERT INTO CLIENTS (FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS, IS_ACTIVE, UPDATED_AT) VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [pick(NAMES), pick(LAST_NAMES), `cliente${inserted}@email.com`, `+57${randInt(3000000000, 3999999999)}`, `${pick(STREETS)} ${randInt(1, 99)} #${randInt(1, 99)}-${randInt(1, 99)}`, 1, new Date()]
    );

    inserted++;
    commitCount++;
    if (commitCount >= BATCH_COMMIT) {
      await ds.query('COMMIT');
      commitCount = 0;
      progress(inserted, TARGET, start);
    }
  }
  await ds.query('COMMIT');

  const count = await ds.query('SELECT COUNT(*) as C FROM CLIENTS');
  console.log(`\n✅ ${count[0].C.toLocaleString()} clientes (${((Date.now() - start) / 1000).toFixed(1)}s)`);
  return count[0].C;
}

async function seedInvoices(_userCount: number, _clientCount: number): Promise<void> {
  console.log('\n🧾 [6/8] Semillero de INVOICES (100k)...');
  const start = Date.now();

  // Obtener IDs existentes reales
  const userIds = (await ds.query('SELECT ID FROM USERS')).map((r: any) => r.ID);
  const clientIds = (await ds.query('SELECT ID FROM CLIENTS')).map((r: any) => r.ID);
  console.log(`  Usando ${userIds.length} user IDs y ${clientIds.length} client IDs`);

  let inserted = 0;
  let commitCount = 0;
  
  while (inserted < TARGET) {
    const userId = userIds[randInt(0, userIds.length - 1)];
    const clientId = clientIds[randInt(0, clientIds.length - 1)];
    const detailsCount = randInt(1, 5);
    
    let subtotal = 0;
    for (let d = 0; d < detailsCount; d++) {
      subtotal += Math.random() * 99000 + 1000;
    }
    const taxTotal = subtotal * 0.19;
    const total = subtotal + taxTotal;

    await ds.query(
      `INSERT INTO INVOICES (CLIENT_ID, USER_ID, ISSUE_DATE, SUBTOTAL_SNAPSHOT, TAX_TOTAL_SNAPSHOT, TOTAL_SNAPSHOT, TRANSACTION_ID, STATUS, PAYMENT_METHOD, IS_ACTIVE, VERSION) VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11)`,
      [clientId, userId, new Date(Date.now() - randInt(0, 365 * 24 * 60 * 60 * 1000)), subtotal, taxTotal, total, randomBytes(16).toString('hex').toUpperCase(), pick(STATUSES), pick(PAYMENT_METHODS), 1, 0]
    );

    inserted++;
    commitCount++;
    if (commitCount >= BATCH_COMMIT) {
      await ds.query('COMMIT');
      commitCount = 0;
      progress(inserted, TARGET, start);
    }
  }
  await ds.query('COMMIT');

  const count = await ds.query('SELECT COUNT(*) as C FROM INVOICES');
  console.log(`\n✅ ${count[0].C.toLocaleString()} facturas (${((Date.now() - start) / 1000).toFixed(1)}s)`);
}

async function seedInvoiceDetails(): Promise<void> {
  console.log('\n📋 [7/8] Semillero de INVOICE_DETAILS...');
  const start = Date.now();

  const invoiceIds = (await ds.query('SELECT ID FROM INVOICES')).map((r: any) => r.ID);
  const productIds = (await ds.query('SELECT ID FROM PRODUCTS')).map((r: any) => r.ID);
  console.log(`  Usando ${invoiceIds.length} invoice IDs y ${productIds.length} product IDs`);
  
  const total = invoiceIds.length;
  let inserted = 0;
  let commitCount = 0;
  
  while (inserted < total) {
    const invoiceId = invoiceIds[inserted];
    const detailsCount = randInt(1, 5);

    for (let d = 0; d < detailsCount; d++) {
      await ds.query(
        `INSERT INTO INVOICE_DETAILS (INVOICE_ID, PRODUCT_ID, PRODUCT_NAME, QUANTITY, UNIT_PRICE_SNAPSHOT) VALUES (:1, :2, :3, :4, :5)`,
        [invoiceId, productIds[randInt(0, productIds.length - 1)], `Producto #${randInt(1, 100000)}`, randInt(1, 10), Math.random() * 99000 + 1000]
      );
    }

    inserted++;
    commitCount++;
    if (commitCount >= BATCH_COMMIT) {
      await ds.query('COMMIT');
      commitCount = 0;
      progress(inserted, total, start);
    }
  }
  await ds.query('COMMIT');

  const count = await ds.query('SELECT COUNT(*) as C FROM INVOICE_DETAILS');
  console.log(`\n✅ ${count[0].C.toLocaleString()} detalles (${((Date.now() - start) / 1000).toFixed(1)}s)`);
}

async function assignRoles(): Promise<void> {
  console.log('\n🎭 [8/8] Asignando roles...');
  const start = Date.now();

  const userCount = await ds.query('SELECT COUNT(*) as C FROM USERS');
  const roleCount = await ds.query('SELECT COUNT(*) as C FROM ROLES');
  
  let assigned = 0;
  let commitCount = 0;
  const totalAssignments = Math.min(userCount[0].C, 10000);

  while (assigned < totalAssignments) {
    try {
      await ds.query(
        `INSERT INTO USER_ROLES (USER_ID, ROLE_ID) VALUES (:1, :2)`,
        [randInt(1, userCount[0].C), randInt(1, roleCount[0].C)]
      );
    } catch (_e) {
      // Ignorar duplicados
    }

    assigned++;
    commitCount++;
    if (commitCount >= BATCH_COMMIT) {
      await ds.query('COMMIT');
      commitCount = 0;
    }
  }
  await ds.query('COMMIT');

  const count = await ds.query('SELECT COUNT(*) as C FROM USER_ROLES');
  console.log(`✅ ${count[0].C.toLocaleString()} asignaciones (${((Date.now() - start) / 1000).toFixed(1)}s)`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         SEMILLERO MASIVO - 100k por tabla                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📡 Oracle: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);

  try {
    await ds.initialize();
    console.log('✅ Conexión establecida\n');

    const totalStart = Date.now();

    await seedRoles();
    const userCount = await seedUsers();
    await seedTaxes();
    const productCount = await seedProducts();
    const clientCount = await seedClients();
    await seedInvoices(userCount, clientCount);
    await seedInvoiceDetails();
    await assignRoles();

    const totalTime = ((Date.now() - totalStart) / 1000).toFixed(1);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 RESUMEN FINAL                         ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    
    const counts = await Promise.all([
      ds.query('SELECT COUNT(*) as C FROM ROLES'),
      ds.query('SELECT COUNT(*) as C FROM USERS'),
      ds.query('SELECT COUNT(*) as C FROM TAXES'),
      ds.query('SELECT COUNT(*) as C FROM PRODUCTS'),
      ds.query('SELECT COUNT(*) as C FROM CLIENTS'),
      ds.query('SELECT COUNT(*) as C FROM INVOICES'),
      ds.query('SELECT COUNT(*) as C FROM INVOICE_DETAILS'),
      ds.query('SELECT COUNT(*) as C FROM USER_ROLES'),
    ]);

    console.log(`║  ROLES:          ${String(counts[0][0].C).padStart(12)}                          ║`);
    console.log(`║  USERS:          ${String(counts[1][0].C).padStart(12)}                          ║`);
    console.log(`║  TAXES:          ${String(counts[2][0].C).padStart(12)}                          ║`);
    console.log(`║  PRODUCTS:       ${String(counts[3][0].C).padStart(12)}                          ║`);
    console.log(`║  CLIENTS:        ${String(counts[4][0].C).padStart(12)}                          ║`);
    console.log(`║  INVOICES:       ${String(counts[5][0].C).padStart(12)}                          ║`);
    console.log(`║  INVOICE_DETAILS:${String(counts[6][0].C).padStart(12)}                          ║`);
    console.log(`║  USER_ROLES:     ${String(counts[7][0].C).padStart(12)}                          ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  ⏱️  Tiempo: ${totalTime.padStart(40)}s             ║`);
    console.log('╚════════════════════════════════════════════════════════════╝');

    await ds.destroy();
  } catch (error) {
    console.error('\n❌ Error:', error);
    await ds.destroy();
    process.exit(1);
  }
}

main();