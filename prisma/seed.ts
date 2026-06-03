import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── helpers ─────────────────────────────────────────────────────────────────
/** Generates a random password that meets the system policy:
 *  8-10 chars, ≥1 upper, ≥1 lower, ≥1 number, ≥1 special char.
 * Randomised on every seed run; the value is printed and NOT stored. */
const generatePassword = (): string => {
  const chars = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    special: '@$!%*?&',
  };
  const pick = (src: string) => src[Math.floor(Math.random() * src.length)];
  const all = Object.values(chars).join('');
  const shuffle = (s: string) => s.split('').sort(() => 0.5 - Math.random()).join('');
  const eight = [pick(chars.upper), pick(chars.lower), pick(chars.digits), pick(chars.special),
    pick(all), pick(all), pick(all), pick(all)].join('');
  return shuffle(eight);
};

/** Safe numeric helper: converts Prisma Decimal to number, 0 for null/undefined. */
const num = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  // Prisma Decimal
  if (typeof v === 'object' && v !== null && 'toNumber' in (v as Record<string, unknown>)) {
    return (v as { toNumber(): number }).toNumber();
  }
  return Number(v);
};

// ─── seed data definitions ───────────────────────────────────────────────────
const TAX_DEFS = [
  { name: 'IVA 21%', rate: 21.0 },
  { name: 'VAT 15%', rate: 15.0 },
  { name: 'VAT 0%',  rate: 0.0 },
] as const;

const CLIENT_DEFS = [
  { firstName: 'Juan',      lastName: 'Pérez',      phone: '0991234567', address: 'Av. Siempre Viva 123',  email: 'juan.perez@example.com' },
  { firstName: 'María',    lastName: 'García',      phone: '0997654321', address: 'Calle Falsa 456',       email: 'maria.garcia@example.com' },
  { firstName: 'Carlos',   lastName: 'Rodríguez',   phone: '0981112223', address: 'Plaza Central 789',     email: 'carlos.rodriguez@example.com' },
  { firstName: 'Ana',       lastName: 'Martínez',    phone: '0973334445', address: 'Av. Libertador 1000',    email: 'ana.martinez@example.com' },
  { firstName: 'Pedro',     lastName: 'Sánchez',     phone: '0965556667', address: 'Calle Mayo 234',        email: 'pedro.sanchez@example.com' },
  { firstName: 'Laura',    lastName: 'López',       phone: '0957778889', address: 'Av. 9 de Julio 567',   email: 'laura.lopez@example.com' },
  { firstName: 'Diego',     lastName: 'Fernández',   phone: '0949990001', address: 'Calle Florida 890',    email: 'diego.fernandez@example.com' },
  { firstName: 'Sofía',    lastName: 'Gómez',       phone: '0931112223', address: 'Av. Corrientes 1234',   email: 'sofia.gomez@example.com' },
  { firstName: 'Martín',   lastName: 'Torres',      phone: '0923334445', address: 'Calle San Martín 678', email: 'martin.torres@example.com' },
  { firstName: 'Valentina',lastName: 'Díaz',        phone: '0915556667', address: 'Av. Santa Fe 901',    email: 'valentina.diaz@example.com' },
] as const;

// Product price is stored as `Decimal | null` in Prisma → use num() wrapper
const PRODUCT_DEFS = [
  { name: 'Laptop Dell XPS 15',         price: 1299.99, stock: 8,  taxes: ['IVA 21%', 'VAT 15%'] },
  { name: 'Mouse Logitech MX Master',    price: 89.99,   stock: 25, taxes: ['IVA 21%'] },
  { name: 'Monitor LG 27" 4K',           price: 449.99,  stock: 12, taxes: ['IVA 21%'] },
  { name: 'Teclado Mecánico Corsair K70',price: 159.99,  stock: 15, taxes: ['IVA 21%'] },
  { name: 'Auriculares Sony WH-1000XM5', price: 349.99,  stock: 10, taxes: ['IVA 21%'] },
  { name: 'Webcam Logitech Brio 4K',      price: 199.99,  stock: 20, taxes: ['IVA 21%'] },
  { name: 'USB-C Hub 7-en-1',            price: 49.99,   stock: 40, taxes: ['IVA 21%', 'VAT 15%'] },
  { name: 'SSD Samsung 1TB NVMe',         price: 109.99, stock: 30, taxes: ['IVA 21%'] },
  { name: 'RAM DDR5 32GB Kingston',        price: 129.99,  stock: 18, taxes: ['IVA 21%'] },
  { name: 'Fuente ASUS ROG 850W',         price: 179.99,  stock: 12, taxes: ['IVA 21%'] },
  { name: 'Gabinete NZXT H7',             price: 129.99,  stock: 8,  taxes: ['IVA 21%'] },
  { name: 'Cable HDMI 2.1 3m',            price: 24.99,   stock: 50, taxes: ['IVA 21%'] },
  { name: 'Alfombrilla XL Gaming',         price: 34.99,   stock: 35, taxes: ['IVA 21%', 'VAT 0%'] },
  { name: 'Monitor Dell 24" FullHD',       price: 179.99,  stock: 15, taxes: ['IVA 21%'] },
  { name: 'Impresora HP LaserJet',          price: 299.99, stock: 6,  taxes: ['IVA 21%'] },
  { name: 'Router WiFi 6 AX3000',          price: 159.99,  stock: 14, taxes: ['IVA 21%'] },
  { name: 'Disco HDD 4TB Seagate',         price: 89.99,   stock: 22, taxes: ['IVA 21%'] },
  { name: 'Pad Refrigeración Laptop',      price: 29.99,   stock: 45, taxes: ['IVA 21%'] },
  { name: 'Batería Externa 20000mAh',      price: 39.99,   stock: 10, taxes: ['IVA 21%'] },
  { name: 'Cámara IP WiFi 360°',           price: 79.99,   stock: 16, taxes: ['IVA 21%'] },
] as const;

// ─── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  POS-API SEED — Starting...');
  console.log('═══════════════════════════════════════\n');

  // 1. ROLES
  console.log('▶ Roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMINISTRATOR' },
    update: {},
    create: { name: 'ADMINISTRATOR', description: 'Full system access' },
  });
  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: { name: 'SELLER', description: 'Sales only, read catalogue' },
  });

  // 2. USERS — passwords generated and printed, never stored
  const adminPassword  = generatePassword();
  const sellerPassword = generatePassword();

  console.log('\n🔑 Generated credentials (save these!):');
  console.log(`   Admin  → admin@pos.com   / ${adminPassword}`);
  console.log(`   Seller → seller@pos.com  / ${sellerPassword}`);
  console.log('   (Randomised every seed run — not stored)\n');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: { username: 'admin' },
    create: {
      username: 'admin', name: 'Admin', lastName: 'Root',
      email: 'admin@pos.com',
      password: await bcrypt.hash(adminPassword, 12),
      isActive: true,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@pos.com' },
    update: { username: 'seller' },
    create: {
      username: 'seller', name: 'Seller', lastName: 'Demo',
      email: 'seller@pos.com',
      password: await bcrypt.hash(sellerPassword, 12),
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: sellerUser.id, roleId: sellerRole.id } },
    update: {},
    create: { userId: sellerUser.id, roleId: sellerRole.id },
  });

  // 3. TAXES
  console.log('▶ Taxes...');
  const taxMap: Record<string, number> = {};
  for (const t of TAX_DEFS) {
    const tax = await prisma.tax.upsert({
      where: { name: t.name },
      update: { currentRate: t.rate },
      create: { name: t.name, currentRate: t.rate },
    });
    taxMap[t.name] = tax.id;
  }

  // 4. CLIENTS
  console.log('▶ Clients...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRecords: any[] = [];
  for (const c of CLIENT_DEFS) {
    clientRecords.push(
      await prisma.client.upsert({
        where: { email: c.email },
        update: { firstName: c.firstName, lastName: c.lastName, phone: c.phone, address: c.address },
        create: c,
      }),
    );
  }

  // 5. PRODUCTS + TAX RELATIONS + STOCK MOVEMENTS (ENTRY audit trail)
  console.log('▶ Products + Stock Movements...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productRecords: any[] = [];
  for (const p of PRODUCT_DEFS) {
    const product = await prisma.product.upsert({
      where: { name: p.name },
      update: { price: p.price, stock: p.stock },
      create: { name: p.name, price: p.price, stock: p.stock, version: 0 },
    });

    // Replace tax relations
    await prisma.productTax.deleteMany({ where: { productId: product.id } });
    for (const taxName of p.taxes) {
      const tid = taxMap[taxName];
      if (tid) await prisma.productTax.create({ data: { productId: product.id, taxId: tid } });
    }

    // Stock Movement ENTRY: initial inventory audit (req. #31)
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'ENTRY',
        quantity: p.stock,
        previousStock: 0,
        newStock: p.stock,
        userId: adminUser.id,
        reference: 'Stock inicial cargado por seed',
      },
    });

    productRecords.push(product);
  }

  // 6. TEST INVOICES — one per status to verify all three flows
  console.log('▶ Test Invoices...');

  // ── A: DRAFT — editable, no stock deducted
  const draftPriceNum = num(productRecords[0].price);
  const draftTaxAmt   = draftPriceNum * 0.21;
  await prisma.invoice.create({
    data: {
      clientId: clientRecords[0].id,
      userId:   sellerUser.id,
      status:   'DRAFT',
      paymentMethod: 'CASH',
      isActive: true,
      subtotalSnapshot: draftPriceNum,
      taxTotalSnapshot: draftTaxAmt,
      totalSnapshot:    draftPriceNum + draftTaxAmt,
      details: {
        create: [{
          productId: productRecords[0].id,
          productName: productRecords[0].name,
          quantity: 1,
          unitPriceSnapshot: draftPriceNum,
          detailTaxes: { create: draftPriceNum > 0 ? [{ taxId: taxMap['IVA 21%'], rateSnapshot: 21.0, calculatedAmountSnapshot: draftTaxAmt }] : [] },
        }],
      },
    },
  });

  // ── B: CONFIRMED — stock already deducted, movement recorded
  const confPriceNum = num(productRecords[1].price);
  const confQty    = 2;
  const confSub    = confPriceNum * confQty;
  const confTax    = confSub * 0.21;
  const confTotal  = confSub + confTax;
  const priorStock1 = num(productRecords[1].stock) + confQty; // stock was reduced by seed; reconstruct prior

  await prisma.product.updateMany({
    where: { id: productRecords[1].id },
    data: { stock: { decrement: confQty }, version: { increment: 1 } },
  });

  const confirmedInvoice = await prisma.invoice.create({
    data: {
      clientId: clientRecords[1].id,
      userId:   sellerUser.id,
      status:   'CONFIRMED',
      paymentMethod: 'CASH',
      isActive: true,
      subtotalSnapshot: confSub,
      taxTotalSnapshot: confTax,
      totalSnapshot:    confTotal,
      details: {
        create: [{
          productId: productRecords[1].id,
          productName: productRecords[1].name,
          quantity: confQty,
          unitPriceSnapshot: confPriceNum,
          detailTaxes: { create: [{
            taxId: taxMap['IVA 21%'],
            rateSnapshot: 21.0,
            calculatedAmountSnapshot: confTax,
          }] },
        }],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: productRecords[1].id,
      type: 'EXIT',
      quantity: confQty,
      previousStock: priorStock1,
      newStock: num(productRecords[1].stock),
      userId: sellerUser.id,
      reference: `Venta confirmada #${confirmedInvoice.id}`,
    },
  });

  // ── C: CANCELLED — full cycle: sell → cancel → restore stock
  const cancPriceNum = num(productRecords[2].price);
  const cancQty    = 1;
  const cancSub    = cancPriceNum * cancQty;
  const cancTax    = cancSub * 0.21;
  const cancTotal  = cancSub + cancTax;
  const priorStock2 = num(productRecords[2].stock) + cancQty; // reconstruct before deduct

  // Simulate confirmed sale first
  await prisma.product.updateMany({
    where: { id: productRecords[2].id },
    data: { stock: { decrement: cancQty }, version: { increment: 1 } },
  });

  const cancelledInvoice = await prisma.invoice.create({
    data: {
      clientId: clientRecords[2].id,
      userId:   sellerUser.id,
      status:   'CANCELLED',
      paymentMethod: 'CASH',
      isActive: false,
      subtotalSnapshot: cancSub,
      taxTotalSnapshot: cancTax,
      totalSnapshot:    cancTotal,
      details: {
        create: [{
          productId: productRecords[2].id,
          productName: productRecords[2].name,
          quantity: cancQty,
          unitPriceSnapshot: cancPriceNum,
          detailTaxes: { create: [{
            taxId: taxMap['IVA 21%'],
            rateSnapshot: 21.0,
            calculatedAmountSnapshot: cancTax,
          }] },
        }],
      },
    },
  });

  // EXIT movement for the sale
  await prisma.stockMovement.create({
    data: {
      productId: productRecords[2].id,
      type: 'EXIT',
      quantity: cancQty,
      previousStock: priorStock2,
      newStock: num(productRecords[2].stock),
      userId: sellerUser.id,
      reference: `Venta cancelada #${cancelledInvoice.id}`,
    },
  });

  // ENTRY movement: restore stock on cancellation
  await prisma.product.updateMany({
    where: { id: productRecords[2].id },
    data: { stock: { increment: cancQty }, version: { increment: 1 } },
  });

  await prisma.stockMovement.create({
    data: {
      productId: productRecords[2].id,
      type: 'ENTRY',
      quantity: cancQty,
      previousStock: num(productRecords[2].stock),
      newStock: priorStock2,
      userId: adminUser.id,
      reference: `Reversión stock por cancelación #${cancelledInvoice.id}`,
    },
  });

  // 7. SUMMARY
  console.log('\n═══════════════════════════════════════');
  console.log('  SEED COMPLETE — Summary');
  console.log('═══════════════════════════════════════\n');
  console.log(`  Roles         : ${await prisma.role.count()}`);
  console.log(`  Users         : ${await prisma.user.count()} (1 admin + 1 seller)`);
  console.log(`  Taxes         : ${await prisma.tax.count()}`);
  console.log(`  Clients       : ${await prisma.client.count()}`);
  console.log(`  Products      : ${await prisma.product.count()}`);
  console.log(`  Stock Movs    : ${await prisma.stockMovement.count()}`);
  const statusCounts = await prisma.invoice.groupBy({ by: ['status'], _count: { status: true } });
  statusCounts.forEach(s => console.log(`  Invoices ${s.status.padEnd(12)}: ${s._count.status}`));
  console.log('\n  Test credentials:');
  console.log(`  Admin  → admin@pos.com  / ${adminPassword}`);
  console.log(`  Seller → seller@pos.com / ${sellerPassword}`);
  console.log('\n');
}

main()
  .catch(e => { console.error('\n⛔ Seed failed:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
