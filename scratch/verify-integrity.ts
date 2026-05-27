import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- Verification: DB Level CHECK Constraint ---');
    
    // 1. Create a test product with 0 stock
    const product = await prisma.product.create({
      data: {
        name: `IntegrityTest-${Date.now()}`,
        price: 9.99,
        stock: 0,
        version: 0
      }
    });
    console.log(`Created product ID ${product.id} with stock 0.`);

    // 2. Try to update stock to -1 using raw SQL (bypassing code logic)
    console.log('Attempting to update stock to -1 via raw SQL...');
    try {
      await prisma.$executeRawUnsafe(`UPDATE products SET stock = -1 WHERE id = ${product.id}`);
      console.error('CRITICAL FAILURE: DB allowed negative stock!');
      process.exit(1);
    } catch (error) {
      if (error.message.includes('stock_not_negative')) {
        console.log('SUCCESS: DB blocked negative stock via CHECK constraint (stock_not_negative).');
      } else {
        console.error('Unexpected error during constraint check:', error);
        process.exit(1);
      }
    }

    // 3. Clean up
    await prisma.product.delete({ where: { id: product.id } });
    console.log('Test product cleaned up.');
    console.log('--- Verification Complete: PASS ---');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
