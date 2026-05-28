-- =====================================================
-- MIGRACIÓN: Agregar índices para optimizar consultas
-- Fecha: 2026-05-28
-- Base de datos: Oracle 19c
-- =====================================================
-- Verifica por NOMBRE de índice Y por columna antes de crear
-- =====================================================

SET SERVEROUTPUT ON SIZE 100000;

PROMPT ========================================
PROMPT Starting indexes migration...
PROMPT ========================================
PROMPT

-- =====================================================
-- Función helper para verificar si una columna ya está indexada
-- (solo por nombre de índice, porque Oracle 19c no soporta IF NOT EXISTS)
-- =====================================================

DECLARE
  v_created NUMBER := 0;
  v_skipped NUMBER := 0;
  
  -- Procedure para crear un índice individual
  PROCEDURE CreateIndexIfNotExists(
    p_index_name IN VARCHAR2,
    p_table_name IN VARCHAR2,
    p_columns    IN VARCHAR2
  ) IS
    v_exists NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_exists FROM user_indexes WHERE index_name = p_index_name;
    
    IF v_exists = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX ' || p_index_name || ' ON ' || p_table_name || '(' || p_columns || ')';
      DBMS_OUTPUT.PUT_LINE('CREATED ' || p_index_name);
      v_created := v_created + 1;
    ELSE
      DBMS_OUTPUT.PUT_LINE('SKIP     ' || p_index_name || ' (name exists)');
      v_skipped := v_skipped + 1;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE = -1408 THEN
        DBMS_OUTPUT.PUT_LINE('SKIP     ' || p_index_name || ' (column already indexed)');
        v_skipped := v_skipped + 1;
      ELSE
        DBMS_OUTPUT.PUT_LINE('ERROR    ' || p_index_name || ': ' || SQLERRM);
      END IF;
  END;
  
BEGIN
  DBMS_OUTPUT.PUT_LINE('--- CLIENTS ---');
  CreateIndexIfNotExists('IX_CLIENTS_EMAIL', 'CLIENTS', 'EMAIL');
  CreateIndexIfNotExists('IX_CLIENTS_IS_ACTIVE', 'CLIENTS', 'IS_ACTIVE');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- USERS ---');
  CreateIndexIfNotExists('IX_USERS_EMAIL', 'USERS', 'EMAIL');
  CreateIndexIfNotExists('IX_USERS_USERNAME', 'USERS', 'USERNAME');
  CreateIndexIfNotExists('IX_USERS_IS_ACTIVE', 'USERS', 'IS_ACTIVE');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- USER_ROLES ---');
  CreateIndexIfNotExists('IX_USER_ROLES_USER_ID', 'USER_ROLES', 'USER_ID');
  CreateIndexIfNotExists('IX_USER_ROLES_ROLE_ID', 'USER_ROLES', 'ROLE_ID');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- PRODUCTS ---');
  CreateIndexIfNotExists('IX_PRODUCTS_NAME', 'PRODUCTS', 'NAME');
  CreateIndexIfNotExists('IX_PRODUCTS_IS_ACTIVE', 'PRODUCTS', 'IS_ACTIVE');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- TAXES ---');
  CreateIndexIfNotExists('IX_TAXES_NAME', 'TAXES', 'NAME');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- INVOICES ---');
  CreateIndexIfNotExists('IX_INVOICES_CLIENT_ID', 'INVOICES', 'CLIENT_ID');
  CreateIndexIfNotExists('IX_INVOICES_USER_ID', 'INVOICES', 'USER_ID');
  CreateIndexIfNotExists('IX_INVOICES_ISSUE_DATE', 'INVOICES', 'ISSUE_DATE');
  CreateIndexIfNotExists('IX_INVOICES_STATUS', 'INVOICES', 'STATUS');
  CreateIndexIfNotExists('IX_INVOICES_IS_ACTIVE', 'INVOICES', 'IS_ACTIVE');
  CreateIndexIfNotExists('IX_INVOICES_ACTIVE_DATE', 'INVOICES', 'IS_ACTIVE, ISSUE_DATE DESC');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- INVOICE_DETAILS ---');
  CreateIndexIfNotExists('IX_INVOICE_DETAILS_INVOICE_ID', 'INVOICE_DETAILS', 'INVOICE_ID');
  CreateIndexIfNotExists('IX_INVOICE_DETAILS_PRODUCT_ID', 'INVOICE_DETAILS', 'PRODUCT_ID');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- INVOICE_DETAIL_TAXES ---');
  CreateIndexIfNotExists('IX_INVOICE_DETAIL_TAXES_DETAIL_ID', 'INVOICE_DETAIL_TAXES', 'DETAIL_ID');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('--- STOCK_MOVEMENTS ---');
  CreateIndexIfNotExists('IX_STOCK_MOVEMENTS_PRODUCT_ID', 'STOCK_MOVEMENTS', 'PRODUCT_ID');
  
  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('========================================');
  DBMS_OUTPUT.PUT_LINE('Migration completed!');
  DBMS_OUTPUT.PUT_LINE('Created: ' || v_created);
  DBMS_OUTPUT.PUT_LINE('Skipped: ' || v_skipped);
  DBMS_OUTPUT.PUT_LINE('========================================');
END;
/
