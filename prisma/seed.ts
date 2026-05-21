import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seed ---');

  console.log('Seeding Roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMINISTRATOR' },
    update: { name: 'ADMINISTRATOR' },
    create: { name: 'ADMINISTRATOR' },
  });
  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: { name: 'SELLER' },
    create: { name: 'SELLER' },
  });

  console.log('Seeding Admin User...');
  const adminPassword = await bcrypt.hash('Admin123@', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: { username: 'admin', name: 'Admin', lastName: 'User' },
    create: {
      username: 'admin',
      name: 'Admin',
      lastName: 'User',
      email: 'admin@pos.com',
      password: adminPassword,
      isActive: true,
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Seeding Taxes...');
  const taxDefinitions = [
    { name: 'VAT 15%', currentRate: 15.00 },
    { name: 'VAT 0%', currentRate: 0.00 },
    { name: 'IVA 21%', currentRate: 21.00 },
  ];

  for (const t of taxDefinitions) {
    await prisma.tax.upsert({
      where: { name: t.name },
      update: { currentRate: t.currentRate },
      create: {
        name: t.name,
        currentRate: t.currentRate,
      },
    });
  }

  console.log('Seeding Clients...');
  const clients = [
    { firstName: 'Juan', lastName: 'Perez', phone: '0991234567', address: 'Av. Siempre Viva 123', email: 'juan.perez@example.com' },
    { firstName: 'Maria', lastName: 'Garcia', phone: '0997654321', address: 'Calle Falsa 456', email: 'maria.garcia@example.com' },
    { firstName: 'Carlos', lastName: 'Rodriguez', phone: '0981112223', address: 'Plaza Central 789', email: 'carlos.rodriguez@example.com' },
    { firstName: 'Ana', lastName: 'Martinez', phone: '0973334445', address: 'Av. Libertador 1000', email: 'ana.martinez@example.com' },
    { firstName: 'Pedro', lastName: 'Sanchez', phone: '0965556667', address: 'Calle Mayo 234', email: 'pedro.sanchez@example.com' },
    { firstName: 'Laura', lastName: 'Lopez', phone: '0957778889', address: 'Av. 9 de Julio 567', email: 'laura.lopez@example.com' },
    { firstName: 'Diego', lastName: 'Fernandez', phone: '0949990001', address: 'Calle Florida 890', email: 'diego.fernandez@example.com' },
    { firstName: 'Sofia', lastName: 'Gomez', phone: '0931112223', address: 'Av. Corrientes 1234', email: 'sofia.gomez@example.com' },
    { firstName: 'Martin', lastName: 'Torres', phone: '0923334445', address: 'Calle San Martin 678', email: 'martin.torres@example.com' },
    { firstName: 'Valentina', lastName: 'Diaz', phone: '0915556667', address: 'Av. Santa Fe 901', email: 'valentina.diaz@example.com' },
    { firstName: 'Lucas', lastName: 'Ramirez', phone: '0907778889', address: 'Calle Rivadavia 345', email: 'lucas.ramirez@example.com' },
    { firstName: 'Camila', lastName: 'Hernandez', phone: '0899990001', address: 'Av. Callao 234', email: 'camila.hernandez@example.com' },
    { firstName: 'Santiago', lastName: 'Morales', phone: '0881112223', address: 'Calle Tucuman 567', email: 'santiago.morales@example.com' },
    { firstName: 'Isabella', lastName: 'Rojas', phone: '0873334445', address: 'Av. Buenos Aires 890', email: 'isabella.rojas@example.com' },
    { firstName: 'Benjamin', lastName: 'Muñoz', phone: '0865556667', address: 'Calle Mendoza 123', email: 'benjamin.munoz@example.com' },
  ];

  for (const c of clients) {
    await prisma.client.upsert({
      where: { email: c.email },
      update: {
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        address: c.address,
      },
      create: c,
    });
  }

  console.log('Seeding Products...');
  // Get the taxes to know their IDs
  const dbTaxes = await prisma.tax.findMany();
  const vat21Tax = dbTaxes.find(t => t.name === 'IVA 21%');
  const vat15Tax = dbTaxes.find(t => t.name === 'VAT 15%');
  const vat0Tax = dbTaxes.find(t => t.name === 'VAT 0%');

  const products = [
    { name: 'Laptop Dell XPS 15', price: 1299.99, stock: 8, taxIds: [vat21Tax?.id, vat15Tax?.id].filter(Boolean) },
    { name: 'Mouse Logitech MX Master', price: 89.99, stock: 25, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Monitor LG 27" 4K', price: 449.99, stock: 12, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Teclado Mecanico Corsair K70', price: 159.99, stock: 15, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Auriculares Sony WH-1000XM5', price: 349.99, stock: 10, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Webcam Logitech Brio 4K', price: 199.99, stock: 20, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'USB-C Hub 7-en-1', price: 49.99, stock: 40, taxIds: [vat21Tax?.id, vat15Tax?.id].filter(Boolean) },
    { name: 'SSD Samsung 1TB NVMe', price: 109.99, stock: 30, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'RAM DDR5 32GB Kingston', price: 129.99, stock: 18, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Fuente ASUS ROG 850W', price: 179.99, stock: 12, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Gabinete NZXT H7', price: 129.99, stock: 8, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Cable HDMI 2.1 3m', price: 24.99, stock: 50, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Alfombrilla XL Gaming', price: 34.99, stock: 35, taxIds: [vat21Tax?.id, vat0Tax?.id].filter(Boolean) },
    { name: 'Monitor Dell 24" FullHD', price: 179.99, stock: 15, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Impresora HP LaserJet', price: 299.99, stock: 6, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Router WiFi 6 AX3000', price: 159.99, stock: 14, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Disco HDD 4TB Seagate', price: 89.99, stock: 22, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Pad Refrigeracion Laptop', price: 29.99, stock: 45, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Bateria Externa 20000mAh', price: 39.99, stock: 38, taxIds: [vat21Tax?.id].filter(Boolean) },
    { name: 'Camara IP WiFi 360°', price: 79.99, stock: 16, taxIds: [vat21Tax?.id].filter(Boolean) },
  ];

  for (const p of products) {
    // First create the product
    const product = await prisma.product.upsert({
      where: { name: p.name },
      update: { price: p.price, stock: p.stock },
      create: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        version: 0,
      },
    });

    // Delete existing productTax records for this product
    await prisma.productTax.deleteMany({ where: { productId: product.id } });

    // Create new productTax records
    const validTaxIds = p.taxIds.filter((id): id is number => id !== undefined && id !== null);
    for (const tid of validTaxIds) {
      await prisma.productTax.create({
        data: {
          productId: product.id,
          taxId: tid
        }
      });
    }
  }

  console.log('--- Seed Completed Successfully ---');
  console.log(`Created ${clients.length} clients and ${products.length} products`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
