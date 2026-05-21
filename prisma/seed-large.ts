import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Large Data Seed (100,000 records) ---');

  const CLIENT_COUNT = 30000;
  const PRODUCT_COUNT = 30000;
  const INVOICE_COUNT = 40000;

  // 1. Create Roles if not exist
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMINISTRATOR' },
    update: {},
    create: { name: 'ADMINISTRATOR' },
  });
  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: { name: 'SELLER' },
  });

  // 2. Create Admin User
  const adminPassword = await bcrypt.hash('Admin123@', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin_large@pos.com' },
    update: {},
    create: {
      username: 'admin_large',
      name: 'Admin',
      lastName: 'Large',
      email: 'admin_large@pos.com',
      password: adminPassword,
      isActive: true,
      roles: {
        create: { roleId: adminRole.id }
      }
    },
  });

  // 3. Generate Clients in batches
  console.log(`Generating ${CLIENT_COUNT} clients...`);
  for (let i = 0; i < CLIENT_COUNT; i += 5000) {
    const clients = Array.from({ length: Math.min(5000, CLIENT_COUNT - i) }).map((_, idx) => ({
      firstName: `ClientName${i + idx}`,
      lastName: `LastName${i + idx}`,
      email: `client${i + idx}@large.com`,
      phone: `099000${(i + idx).toString().padStart(4, '0')}`,
      address: `Address ${i + idx}`,
      isActive: true
    }));
    await prisma.client.createMany({ data: clients, skipDuplicates: true });
    console.log(`... ${i + clients.length} clients created`);
  }

  // 4. Generate Products in batches
  console.log(`Generating ${PRODUCT_COUNT} products...`);
  for (let i = 0; i < PRODUCT_COUNT; i += 5000) {
    const products = Array.from({ length: Math.min(5000, PRODUCT_COUNT - i) }).map((_, idx) => ({
      name: `ProductLarge${i + idx}`,
      price: Math.random() * 100 + 1,
      stock: Math.floor(Math.random() * 1000) + 10,
      isActive: true,
      version: 0
    }));
    await prisma.product.createMany({ data: products, skipDuplicates: true });
    console.log(`... ${i + products.length} products created`);
  }

  // 5. Generate Invoices
  console.log(`Generating ${INVOICE_COUNT} invoices...`);
  const allClients = await prisma.client.findMany({ select: { id: true }, take: 1000 });
  const allProducts = await prisma.product.findMany({ select: { id: true, name: true, price: true }, take: 1000 });

  for (let i = 0; i < INVOICE_COUNT; i += 2000) {
    const batchSize = Math.min(2000, INVOICE_COUNT - i);
    console.log(`... creating batch starting at ${i}`);
    
    for (let j = 0; j < batchSize; j++) {
      const client = allClients[Math.floor(Math.random() * allClients.length)];
      const product = allProducts[Math.floor(Math.random() * allProducts.length)];
      
      await prisma.invoice.create({
        data: {
          clientId: client.id,
          userId: adminUser.id,
          status: 'CONFIRMED',
          transactionId: `LARGE-TRX-${i + j}`,
          totalSnapshot: product.price,
          subtotalSnapshot: product.price,
          taxTotalSnapshot: 0,
          issueDate: new Date(),
          details: {
            create: {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              unitPriceSnapshot: product.price
            }
          }
        }
      });
    }
  }

  console.log('--- Large Data Seed Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
