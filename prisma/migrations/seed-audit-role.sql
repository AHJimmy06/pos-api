-- ============================================
-- S2: Seed AUDIT role + invoiceNumber column
-- Run after: npx prisma migrate dev (or prod)
-- ============================================

-- 1. Insert AUDIT role if not exists
INSERT INTO roles (name, description)
VALUES ('AUDITOR', 'Auditoría y reconstrucción de ventas')
ON CONFLICT (name) DO NOTHING;

-- 2. Add invoice_number column (if not exists, safe for repeated runs)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'invoice_number'
    ) THEN
        ALTER TABLE invoices ADD COLUMN invoice_number VARCHAR(20) UNIQUE;
    END IF;
END $$;

-- 3. Generate invoice numbers for existing invoices (format: 001-001-0000001)
DO $$
DECLARE
    inv RECORD;
    seq INT := 1;
BEGIN
    FOR inv IN SELECT id FROM invoices ORDER BY id LOOP
        UPDATE invoices 
        SET invoice_number = '001-001-' || LPAD(seq::TEXT, 7, '0')
        WHERE id = inv.id AND invoice_number IS NULL;
        seq := seq + 1;
    END LOOP;
END $$;

-- 4. Create sequence for auto-incrementing invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- ============================================
-- ROLLBACK (if needed):
-- DELETE FROM roles WHERE name = 'AUDITOR';
-- ALTER TABLE invoices DROP COLUMN IF EXISTS invoice_number;
-- DROP SEQUENCE IF EXISTS invoice_number_seq;
-- ============================================
