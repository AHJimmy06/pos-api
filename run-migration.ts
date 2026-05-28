/**
 * Script para ejecutar migraciones de SQL
 * Uso: npx ts-node run-migration.ts [nombre-del-archivo.sql]
 */

import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error('Usage: npx ts-node run-migration.ts <migration-file.sql>');
    console.error('Example: npx ts-node run-migration.ts 001_add_indexes.sql');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'oracle',
    connectString: `${process.env.DB_HOST || 'oracle-db-server.mshome.net'}:${process.env.DB_PORT || '1521'}/${process.env.DB_DATABASE || 'ORCLPDB1'}`,
    username: process.env.DB_USERNAME || 'nest_user',
    password: process.env.DB_PASSWORD || 'nest_user',
  });

  try {
    await dataSource.initialize();
    console.log('✓ Connected to Oracle');

    const sqlPath = path.join(__dirname, '..', 'migrations', migrationFile);
    
    if (!fs.existsSync(sqlPath)) {
      console.error(`✗ Migration file not found: ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons but handle Oracle's different statements
    const statements = sql
      .split(/;/g)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      // Skip comments
      if (statement.startsWith('/*') || statement.startsWith('--')) {
        continue;
      }
      
      try {
        // Oracle doesn't support IF NOT EXISTS for indexes in standard SQL
        // We need to handle this differently - wrap in PL/SQL or catch errors
        if (statement.toUpperCase().includes('CREATE INDEX IF NOT EXISTS')) {
          // Convert to Oracle syntax: use EXCEPTION block
          const indexName = statement.match(/IX_\w+/)?.[0] || 'UNKNOWN';
          const tableName = statement.match(/ON\s+(\w+)/i)?.[1] || 'UNKNOWN';
          
          console.log(`  Creating index ${indexName} on ${tableName}...`);
          
          // Oracle doesn't support CREATE INDEX IF NOT EXISTS
          // We'll try to create and catch the error if it exists
          const oracleStatement = statement
            .replace(/IF NOT EXISTS\s+/gi, '')
            .replace(/;\s*$/, '');
            
          try {
            await dataSource.query(oracleStatement);
            console.log(`    ✓ ${indexName} created`);
            successCount++;
          } catch (err: any) {
            if (err.message?.includes('ORA-00955') || err.message?.includes('already exists')) {
              console.log(`    ⊘ ${indexName} already exists, skipping`);
            } else {
              throw err;
            }
          }
        } else {
          await dataSource.query(statement);
          console.log(`  ✓ Executed`);
          successCount++;
        }
      } catch (err: any) {
        // Ignore "already exists" errors for indexes
        if (err.message?.includes('ORA-00955') || err.message?.includes('already exists')) {
          console.log(`    ⊘ Already exists, skipping`);
        } else if (err.message?.includes('ORA-00942') || err.message?.includes('table or view does not exist')) {
          console.log(`    ⊘ Table not found, skipping`);
        } else {
          console.error(`    ✗ Error: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n========================================');
    console.log(`Migration completed: ${successCount} success, ${errorCount} errors`);
    console.log('========================================');

  } catch (err) {
    console.error('✗ Migration failed:', err);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runMigration();