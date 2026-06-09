import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed del POS — 100 registros por tabla, 2 roles reales.
 *
 * Diseño:
 *  - 2 roles exactos: ADMINISTRATOR y SELLER. Estos son los únicos nombres
 *    que el `UserRole` enum acepta y, por lo tanto, los únicos con los que
 *    el `RolesGuard` puede matchear `@Roles(...)`.
 *  - 100 users. Los dos primeros son los actores estables para login/demo:
 *      id=1  adminpos@gmail.com   -> ADMINISTRATOR
 *      id=2  sellerpos@gmail.com  -> SELLER
 *    Los 98 restantes tienen nombres humanos (firstName + lastName del pool)
 *    y username = <inicial first> + <lastName> + <idx padded> para garantizar
 *    unicidad sin colisiones.
 *  - Asignación user_role 1:1 determinista por id (round-robin estricto):
 *      id impar  -> ADMINISTRATOR (50 users)
 *      id par    -> SELLER       (50 users)
 *  - TRUNCATE ... RESTART IDENTITY CASCADE de las 13 tablas. Borra por
 *    construcción la fila huérfana `ADMINISTRATOR("admin")` (id=101) y los
 *    100 `ROLE_NNN` del seed viejo.
 *  - Misma password hasheada para los 100 users con bcrypt salt 12
 *    (Password123!) — la performance del seed importa.
 *  - 3 invoices de cada status (DRAFT / CONFIRMED / CANCELLED) repartidos
 *    uniformemente para cubrir las tres rutas de la app.
 *  - blocked_users baja de "100 = todos" (seed viejo) a ~10%, que es la
 *    lógica de negocio real: el sistema bloquea tras 3 intentos fallidos,
 *    no por defecto.
 *  - Random determinista (mulberry32, seed 20260608) → mismo dataset en
 *    cada corrida.
 */

function makeRandom(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = makeRandom(20260608);
const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(random() * arr.length)];
const randInt = (min: number, max: number): number =>
  Math.floor(random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, decimals = 2): number =>
  parseFloat((random() * (max - min) + min).toFixed(decimals));
const shuffled = <T>(arr: readonly T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Genera una cédula ecuatoriana aleatoria y válida.
 * Módulo 10 sobre los primeros 9 dígitos, igual que la validación del DTO.
 */
function generateEcuadorianCedula(): string {
  const province =
    random() < 0.95 ? randInt(1, 24).toString().padStart(2, '0') : '30';
  const third = randInt(0, 5).toString();
  const rest = Array.from({ length: 6 }, () => randInt(0, 9)).join('');
  const nineDigits = province + third + rest;
  const digits = nineDigits.split('').map(Number);
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const product = digits[i] * coefficients[i];
    sum += product >= 10 ? product - 9 : product;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return nineDigits + checkDigit.toString();
}

// ─── data pools ──────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Diego', 'Sofía',
  'Martín', 'Valentina', 'Lucas', 'Camila', 'Sebastián', 'Isabella', 'Mateo',
  'Lucía', 'Nicolás', 'Victoria', 'Joaquín', 'Martina', 'Benjamín', 'Catalina',
  'Thiago', 'Renata', 'Gael', 'Emilia', 'Santiago', 'Josefina', 'Bautista', 'Mía',
];

const LAST_NAMES = [
  'Pérez', 'García', 'Rodríguez', 'Martínez', 'Sánchez', 'López', 'Fernández',
  'Gómez', 'Torres', 'Díaz', 'Ruiz', 'Romero', 'Alvarez', 'Moreno', 'Gutiérrez',
  'González', 'Hernández', 'Jiménez', 'Ramos', 'Vázquez', 'Domínguez', 'Castro',
  'Suárez', 'Molina', 'Delgado', 'Iglesias', 'Cortés', 'Ortiz', 'Marín', 'Castillo',
];

const PRODUCT_NAMES = [
  'Laptop Dell XPS 15', 'Mouse Logitech MX Master', 'Monitor LG 27" 4K',
  'Teclado Mecánico Corsair K70', 'Auriculares Sony WH-1000XM5', 'Webcam Logitech Brio 4K',
  'USB-C Hub 7-en-1', 'SSD Samsung 1TB NVMe', 'RAM DDR5 32GB Kingston',
  'Fuente ASUS ROG 850W', 'Gabinete NZXT H7', 'Cable HDMI 2.1 3m',
  'Alfombrilla XL Gaming', 'Monitor Dell 24" FullHD', 'Impresora HP LaserJet',
  'Router WiFi 6 AX3000', 'Disco HDD 4TB Seagate', 'Pad Refrigeración Laptop',
  'Batería Externa 20000mAh', 'Cámara IP WiFi 360°', 'Notebook Lenovo ThinkPad',
  'Tablet Samsung Galaxy S9', 'Smartphone iPhone 15', 'Smartwatch Apple Watch',
  'Cargador Inalámbrico 15W', 'Soporte Monitor Ergonómico', 'Silla Gamer Secretlab',
  'Escritorio Eléctrico', 'Lámpara LED Escritorio', 'Disco SSD 500GB WD',
  'Memoria USB 128GB', 'Lector Tarjetas USB-C', 'Adaptador Bluetooth 5.0',
  'Micrófono Blue Yeti', 'Webcam Razer Kiyo', 'Teclado Logitech MX Keys',
  'Mouse Pad RGB', 'Auriculares HyperX Cloud II', 'Parlante Bluetooth JBL',
  'Echo Dot 5ta Gen', 'Google Nest Hub', 'Smart Plug TP-Link',
  'Bombilla LED Philips Hue', 'Strip LED RGB 5m', 'Router Mesh TP-Link Deco',
  'Repetidor WiFi AC750', 'Switch Gigabit 8 puertos', 'UPS APC 1500VA',
  'Regleta con USB', 'Organizador Cables', 'Mochila para Notebook 15"',
  'Funda Tablet 10"', 'Protector Pantalla iPhone', 'Cargador USB-C 65W',
  'Cable USB-C a Lightning', 'Hub USB 3.0 4 puertos', 'Disco Externo 2TB',
  'NAS Synology 2 bahías', 'Lector DNI electrónico', 'Firma Digital Token',
  'Webcam Microsoft LifeCam', 'Auriculares Jabra Evolve2', 'Cámara Seguridad Arlo',
  'Timbre Inteligente Ring', 'Cerradura Smart Yale', 'Termostato Nest',
  'Sensor Movimiento Xiaomi', 'Sensor Puerta Xiaomi', 'Aspiradora Robot Roomba',
  'Purificador Aire Xiaomi', 'Humidificador Ultrasónico', 'Cafetera Oster',
  'Licuadora Philips', 'Tostadora Black & Decker', 'Microondas Samsung',
  'Heladera Whirlpool', 'Lavarropas Drean', 'Aire Acondicionado Split',
  'Estufa Eléctrica', 'Ventilador de Pie', 'Smart TV 50" 4K',
  'Soundbar JBL 2.1', 'Proyector LED Full HD', 'PlayStation 5',
  'Xbox Series X', 'Nintendo Switch OLED', 'Mando PS5 DualSense',
  'Mando Xbox Series', 'Juego PS5 FIFA 24', 'Auriculares PS5 Pulse',
  'Cámara PS5 HD', 'Soporte TV 50"', 'Cables HDMI Cert Premium',
  'Adaptador DisplayPort a HDMI', 'Estabilizador Tensión', 'Filtro Línea',
  'UPS Forza 1000VA', 'Batería UPS 12V 7Ah',
];

const TAX_NAMES = [
  'IVA 21%', 'IVA 10.5%', 'IVA 27%', 'IVA 5%', 'Exento', 'No Gravado',
  'IVA 19%', 'IVA 18%', 'IVA 15%', 'IVA 12%', 'Percepción IIBB 3%',
  'Percepción IIBB 5%', 'Retención Ganancias 2%', 'Retención IVA 10.5%',
  'Impuesto Interno 6%', 'Tasa Municipal 1%',
];

const EXCEPTION_TYPES = [
  'ValidationException', 'BusinessException', 'NotFoundException',
  'UnauthorizedException', 'DatabaseException', 'PaymentException',
  'StockException', 'TaxException', 'InvoiceException', 'ConcurrencyException',
];

const PATHS = [
  '/api/clients', '/api/products', '/api/invoices', '/api/users',
  '/api/auth/login', '/api/pos/checkout', '/api/taxes', '/api/reports',
  '/api/products/stock', '/api/invoices/cancel',
];

const SOURCES = [
  'ClientService', 'ProductService', 'InvoiceService', 'AuthService',
  'UserService', 'POSService', 'TaxService', 'ReportService',
  'DatabaseConnection', 'ExternalAPI', 'StockMovementService',
];

const STOCK_REFS = [
  'Stock inicial', 'Reposición proveedor', 'Venta confirmada',
  'Cancelación de venta', 'Ajuste inventario', 'Devolución cliente',
  'Merma detectada', 'Inventario físico', 'Transferencia entre depósitos',
];

const ERROR_MESSAGES = [
  'Validation failed: email is required',
  'Insufficient stock for product',
  'Client not found',
  'Invalid credentials',
  'Database connection timeout',
  'Tax rate not configured for category',
  'Invoice total mismatch',
  'Product price changed since add to cart',
  'Concurrent modification detected (version conflict)',
  'Session expired',
  'Cedula field is required for new clients',
  'Cannot delete client with associated invoices',
  'Tax rate out of range (0-100)',
  'Product stock cannot be negative',
  'Invoice number already exists',
];

const STATUSES = ['DRAFT', 'CONFIRMED', 'CANCELLED'] as const;
const STOCK_MOVE_TYPES = ['ENTRY', 'EXIT'] as const;

/** Quita tildes/espacios y pasa a minúsculas. Sirve para usernames únicos. */
function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  POS-API SEED — 100 por tabla, 2 roles');
  console.log('═══════════════════════════════════════\n');

  // 1. VACIAR LA BASE DE DATOS
  console.log('🗑️  Vaciando base de datos (TRUNCATE CASCADE)...');
  await prisma.$executeRaw`TRUNCATE TABLE
    "invoice_detail_taxes",
    "invoice_details",
    "stock_movements",
    "invoices",
    "product_taxes",
    "products",
    "taxes",
    "blocked_users",
    "user_roles",
    "users",
    "roles",
    "clients",
    "error_logs"
    RESTART IDENTITY CASCADE`;
  console.log('   ✓ 13 tablas vaciadas y secuencias reseteadas\n');

  // 2. SEMBRAR
  console.log('🌱 Sembrando...\n');

  // ── roles (2) ──
  console.log('▶ roles .................... 2');
  await prisma.role.createMany({
    data: [
      {
        name: 'ADMINISTRATOR',
        description: 'Administrador del sistema con acceso total',
      },
      {
        name: 'SELLER',
        description: 'Vendedor — registra ventas y consulta catálogo',
      },
    ],
  });

  const administratorRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'ADMINISTRATOR' },
  });
  const sellerRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'SELLER' },
  });

  // ── users (100) ──
  // id=1 adminpos (ADMIN), id=2 sellerpos (SELLER),
  // id=3..100 humanos con username firstInitial+lastName+idx.
  console.log('▶ users .................... 100');
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const usersData: Array<{
    username: string;
    name: string;
    lastName: string;
    cedula: string | null;
    email: string;
    password: string;
    isActive: boolean;
  }> = [];

  // ids 1 y 2: actores fijos para login/demo
  usersData.push({
    username: 'admin',
    name: 'Admin',
    lastName: 'POS',
    cedula: null,
    email: 'adminpos@gmail.com',
    password: passwordHash,
    isActive: true,
  });
  usersData.push({
    username: 'seller',
    name: 'Seller',
    lastName: 'POS',
    cedula: null,
    email: 'sellerpos@gmail.com',
    password: passwordHash,
    isActive: true,
  });

  // ids 3..100: humanos, idx del array = id - 1 (0-indexed)
  for (let idx = 3; idx <= 100; idx++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const username = `${slugify(firstName)[0]}${slugify(lastName)}${String(idx).padStart(2, '0')}`;
    usersData.push({
      username,
      name: firstName,
      lastName,
      cedula: random() > 0.3 ? `${randInt(20, 40)}${randInt(10000, 99999)}` : null,
      email: `${username}@pos.com`,
      password: passwordHash,
      isActive: random() > 0.1,
    });
  }

  await prisma.user.createMany({ data: usersData });
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, lastName: true },
    orderBy: { id: 'asc' },
  });

  // ── user_roles (100) ──
  // Round-robin por id: impar -> ADMINISTRATOR, par -> SELLER.
  // Con id=1 admin (impar) y id=2 seller (par), quedan 50 y 50 exactos.
  console.log('▶ user_roles ............... 100');
  const userRolesData = allUsers.map((u) => ({
    userId: u.id,
    roleId: u.id % 2 === 1 ? administratorRole.id : sellerRole.id,
  }));
  await prisma.userRole.createMany({ data: userRolesData });

  const allUserIds = allUsers.map((u) => u.id);

  // ── blocked_users (~10%) ──
  // Antes era 1:1 con users; ahora solo ~10% están bloqueados, que es
  // la lógica de negocio real (3 intentos fallidos).
  const blockedCount = 10;
  console.log(`▶ blocked_users ............ ${blockedCount}`);
  await prisma.blockedUser.createMany({
    data: shuffled(allUserIds)
      .slice(0, blockedCount)
      .map((userId) => ({
        userId,
        failedAttempts: randInt(3, 10),
        blockedAt: new Date(Date.now() - randInt(0, 30) * 24 * 60 * 60 * 1000),
      })),
  });

  // ── clients (100) ──
  console.log('▶ clients .................. 100');
  await prisma.client.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      firstName: pick(FIRST_NAMES),
      lastName: pick(LAST_NAMES),
      cedula: generateEcuadorianCedula(),
      phone: `${randInt(10, 99)}${randInt(1000000, 9999999)}`,
      address: `${pick(['Av.', 'Calle', 'Pasaje'])} ${pick(FIRST_NAMES)} ${randInt(100, 9999)}`,
      email: `client${i.toString().padStart(3, '0')}@example.com`,
      isActive: random() > 0.05,
    })),
  });
  const allClientData = await prisma.client.findMany();

  // ── taxes (100) ──
  console.log('▶ taxes .................... 100');
  const taxData = Array.from({ length: 100 }, (_, i) => ({
    name: i < TAX_NAMES.length ? TAX_NAMES[i] : `Impuesto Custom ${i}`,
    currentRate: randFloat(0, 30, 2),
  }));
  await prisma.tax.createMany({ data: taxData });
  const allTaxData = await prisma.tax.findMany();
  const allTaxIds = allTaxData.map((t) => t.id);

  // ── products (100) ──
  console.log('▶ products ................. 100');
  await prisma.product.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      name: i < PRODUCT_NAMES.length ? PRODUCT_NAMES[i] : `Producto Genérico #${i}`,
      price: randFloat(10, 1500, 2),
      stock: randInt(0, 50),
      isActive: random() > 0.05,
    })),
  });
  const allProductData = await prisma.product.findMany();
  const allProductIds = allProductData.map((p) => p.id);

  // ── product_taxes (100) ──
  console.log('▶ product_taxes ............ 100');
  await prisma.productTax.createMany({
    data: Array.from({ length: 100 }, () => ({
      productId: pick(allProductIds),
      taxId: pick(allTaxIds),
    })),
  });

  // ── invoices (100) ──
  // ~33% de cada status para cubrir las tres rutas de la app
  console.log('▶ invoices ................. 100');
  const shuffledStatuses = shuffled(
    [...STATUSES].flatMap((s) => Array(34).fill(s)),
  ).slice(0, 100);
  const invoicesData = Array.from({ length: 100 }, (_, i) => {
    const client = pick(allClientData);
    const user = pick(allUsers);
    const status = shuffledStatuses[i];
    const subtotal = randFloat(100, 5000, 2);
    const taxRate = randFloat(0.1, 0.3, 2);
    const taxTotal = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + taxTotal).toFixed(2));
    const daysAgo = randInt(0, 90);
    return {
      clientId: client.id,
      userId: user.id,
      issueDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      subtotalSnapshot: subtotal,
      taxTotalSnapshot: taxTotal,
      totalSnapshot: total,
      transactionId: `TXN-${randInt(100000, 999999)}`,
      invoiceNumber: `INV-${(i + 1).toString().padStart(6, '0')}`,
      status,
      paymentMethod: 'CASH' as const,
      isActive: status !== 'CANCELLED',
      version: 0,
      clientNameSnapshot: `${client.firstName} ${client.lastName}`,
      clientEmailSnapshot: client.email,
      sellerNameSnapshot: `${user.name} ${user.lastName}`,
    };
  });
  await prisma.invoice.createMany({ data: invoicesData });
  const allInvoiceIds = (await prisma.invoice.findMany({ select: { id: true } })).map(
    (i) => i.id,
  );

  // ── invoice_details (100) ──
  console.log('▶ invoice_details .......... 100');
  await prisma.invoiceDetail.createMany({
    data: Array.from({ length: 100 }, () => {
      const product = pick(allProductData);
      const quantity = randInt(1, 10);
      const unitPrice = parseFloat(String(product.price ?? 0));
      return {
        invoiceId: pick(allInvoiceIds),
        productId: product.id,
        productName: product.name ?? 'Producto',
        quantity,
        unitPriceSnapshot: unitPrice,
      };
    }),
  });
  const allDetailIds = (
    await prisma.invoiceDetail.findMany({ select: { id: true } })
  ).map((d) => d.id);

  // ── invoice_detail_taxes (100) ──
  console.log('▶ invoice_detail_taxes ..... 100');
  await prisma.invoiceDetailTax.createMany({
    data: Array.from({ length: 100 }, () => {
      const tax = pick(allTaxData);
      const rate = Number(tax.currentRate ?? 0);
      const calculatedAmount = randFloat(10, 500, 2);
      return {
        detailId: pick(allDetailIds),
        taxId: tax.id,
        rateSnapshot: rate,
        calculatedAmountSnapshot: calculatedAmount,
      };
    }),
  });

  // ── stock_movements (100) ──
  console.log('▶ stock_movements .......... 100');
  await prisma.stockMovement.createMany({
    data: Array.from({ length: 100 }, () => {
      const product = pick(allProductData);
      const type = pick(STOCK_MOVE_TYPES);
      const quantity = randInt(1, 20);
      const previousStock = product.stock ?? 0;
      const newStock =
        type === 'ENTRY' ? previousStock + quantity : Math.max(0, previousStock - quantity);
      return {
        productId: product.id,
        type,
        quantity,
        previousStock,
        newStock,
        userId: pick(allUserIds),
        reference: pick(STOCK_REFS),
        createdAt: new Date(Date.now() - randInt(0, 60) * 24 * 60 * 60 * 1000),
      };
    }),
  });

  // ── error_logs (100) ──
  console.log('▶ error_logs ............... 100');
  await prisma.errorLog.createMany({
    data: Array.from({ length: 100 }, () => ({
      message: pick(ERROR_MESSAGES),
      stackTrace: `Error: at line ${randInt(1, 500)}\n    at ${pick(SOURCES)}.${pick([
        'create',
        'update',
        'delete',
        'findOne',
        'findAll',
        'validate',
      ])} (prisma/seed.ts:${randInt(1, 999)})`,
      exceptionType: pick(EXCEPTION_TYPES),
      userId: random() > 0.3 ? pick(allUserIds) : null,
      path: pick(PATHS),
      source: pick(SOURCES),
      createdAt: new Date(Date.now() - randInt(0, 30) * 24 * 60 * 60 * 1000),
    })),
  });

  // 3. RESUMEN
  const counts = {
    roles: await prisma.role.count(),
    users: await prisma.user.count(),
    user_roles: await prisma.userRole.count(),
    blocked_users: await prisma.blockedUser.count(),
    clients: await prisma.client.count(),
    taxes: await prisma.tax.count(),
    products: await prisma.product.count(),
    product_taxes: await prisma.productTax.count(),
    invoices: await prisma.invoice.count(),
    invoice_details: await prisma.invoiceDetail.count(),
    invoice_detail_taxes: await prisma.invoiceDetailTax.count(),
    stock_movements: await prisma.stockMovement.count(),
    error_logs: await prisma.errorLog.count(),
  };

  console.log('\n═══════════════════════════════════════');
  console.log('  SEED COMPLETE');
  console.log('═══════════════════════════════════════\n');
  for (const [table, count] of Object.entries(counts)) {
    const ok = count === 100 || (table === 'roles' && count === 2) ? '✓' : '✗';
    console.log(`  ${ok} ${table.padEnd(22)} ${count}`);
  }

  const invoiceByStatus = await prisma.invoice.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  console.log('\n  Distribución de invoices:');
  invoiceByStatus.forEach((s) =>
    console.log(`    ${s.status.padEnd(12)} ${s._count.status}`),
  );

  const userRoleByRole = await prisma.userRole.groupBy({
    by: ['roleId'],
    _count: { roleId: true },
  });
  console.log('\n  Distribución user_roles:');
  for (const r of userRoleByRole) {
    const role = r.roleId === administratorRole.id ? 'ADMINISTRATOR' : 'SELLER';
    console.log(`    ${role.padEnd(15)} ${r._count.roleId}`);
  }

  console.log('\n  Credenciales de prueba:');
  console.log('    Password universal: Password123!');
  console.log('    Admin:   adminpos@gmail.com    (id=1,  ADMINISTRATOR)');
  console.log('    Seller:  sellerpos@gmail.com   (id=2,  SELLER)');
  console.log('    Resto:   userNNN@pos.com       (id=3..100, round-robin 50/50)\n');
}

main()
  .catch((e) => {
    console.error('\n⛔ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
