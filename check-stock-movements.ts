import { createConnection } from 'typeorm';

async function checkStockMovements() {
  const connection = await createConnection({
    type: 'oracle',
    host: process.env.DB_HOST || '172.29.144.6',
    port: parseInt(process.env.DB_PORT || '1521'),
    database: process.env.DB_DATABASE || 'ORCLPDB1',
    username: process.env.DB_USERNAME || 'nest_user',
    password: process.env.DB_PASSWORD || 'nest_user',
    synchronize: false,
    logging: true,
  });

  try {
    // Check if table exists
    const tablesResult = await connection.query(
      `SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME = 'STOCK_MOVEMENTS'`
    );
    
    if (tablesResult.length === 0) {
      console.log('❌ STOCK_MOVEMENTS table does NOT exist!');
      
      // List all tables to see what's available
      const allTables = await connection.query(
        `SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME`
      );
      console.log('\nAvailable tables:');
      allTables.forEach(t => console.log('  -', t.TABLE_NAME));
    } else {
      console.log('✅ STOCK_MOVEMENTS table EXISTS');
      
      // Check table structure
      const columns = await connection.query(
        `SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_DEFAULT 
         FROM USER_TAB_COLUMNS 
         WHERE TABLE_NAME = 'STOCK_MOVEMENTS' 
         ORDER BY COLUMN_ID`
      );
      
      console.log('\nTable structure:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.NULLABLE === 'Y' ? '(nullable)' : '(not null)'}`);
      });
      
      // Try a simple insert to test
      console.log('\nTrying test insert...');
      const testResult = await connection.query(
        `INSERT INTO STOCK_MOVEMENTS (PRODUCT_ID, TYPE, QUANTITY, PREVIOUS_STOCK, NEW_STOCK, USER_ID, REFERENCE)
         VALUES (:1, :2, :3, :4, :5, :6, :7)`,
        [230001, 'EXIT', 1, 158, 157, 1, 'Test insert']
      );
      console.log('Test insert result:', testResult);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.close();
  }
}

checkStockMovements();
