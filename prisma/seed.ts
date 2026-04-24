import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seed ---');

  console.log('Seeding Taxes...');
  const taxes = [
    { name: 'VAT 15%', currentRate: 15.00 },
    { name: 'VAT 0%', currentRate: 0.00 },
  ];

  for (const t of taxes) {
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
  const products = [
    { name: 'Laptop Dell XPS', price: 1200.00, stock: 10 },
    { name: 'Mouse Logitech', price: 25.00, stock: 50 },
    { name: 'Monitor LG 27"', price: 350.00, stock: 15 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: { price: p.price, stock: p.stock },
      create: {
        name: p.name,
        price: p.price,
        stock: p.stock,
      },
    });
  }

  console.log('--- Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

