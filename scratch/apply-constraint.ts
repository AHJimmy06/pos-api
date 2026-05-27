import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Applying manual constraint: stock >= 0...');
    await prisma.$executeRawUnsafe('ALTER TABLE products ADD CONSTRAINT stock_not_negative CHECK (stock >= 0);');
    console.log('Constraint applied successfully.');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Constraint already exists, skipping.');
    } else {
      console.error('Error applying constraint:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
