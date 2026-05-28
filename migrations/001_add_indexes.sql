-- =====================================================
-- MIGRACIÓN: Agregar índices para optimizar consultas
-- Fecha: 2026-05-28
-- Base de datos: Oracle
-- =====================================================

-- Este script usa bloques PL/SQL para verificar si el índice
-- existe antes de crearlo (idempotente)

SET SERVEROUTPUT ON;

-- =====================================================
-- Función helper para verificar existencia de índice
-- =====================================================
DECLARE
  v_index_count NUMBER;
BEGIN
  -- =====================================================
  -- CLIENTS
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_CLIENTS_EMAIL';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_CLIENTS_EMAIL ON CLIENTS(EMAIL)';
    DBMS_OUTPUT.PUT_LINE('Created IX_CLIENTS_EMAIL on CLIENTS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_CLIENTS_EMAIL already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_CLIENTS_IS_ACTIVE';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_CLIENTS_IS_ACTIVE ON CLIENTS(IS_ACTIVE)';
    DBMS_OUTPUT.PUT_LINE('Created IX_CLIENTS_IS_ACTIVE on CLIENTS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_CLIENTS_IS_ACTIVE already exists, skipping');
  END IF;

  -- =====================================================
  -- USERS
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USERS_EMAIL';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_USERS_EMAIL ON USERS(EMAIL)';
    DBMS_OUTPUT.PUT_LINE('Created IX_USERS_EMAIL on USERS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_USERS_EMAIL already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USERS_USERNAME';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_USERS_USERNAME ON USERS(USERNAME)';
    DBMS_OUTPUT.PUT_LINE('Created IX_USERS_USERNAME on USERS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_USERS_USERNAME already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USERS_IS_ACTIVE';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_USERS_IS_ACTIVE ON USERS(IS_ACTIVE)';
    DBMS_OUTPUT.PUT_LINE('Created IX_USERS_IS_ACTIVE on USERS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_USERS_IS_ACTIVE already exists, skipping');
  END IF;

  -- =====================================================
  -- USER_ROLES
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USER_ROLES_USER_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_USER_ROLES_USER_ID ON USER_ROLES(USER_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_USER_ROLES_USER_ID on USER_ROLES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_USER_ROLES_USER_ID already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USER_ROLES_ROLE_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_USER_ROLES_ROLE_ID ON USER_ROLES(ROLE_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_USER_ROLES_ROLE_ID on USER_ROLES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_USER_ROLES_ROLE_ID already exists, skipping');
  END IF;

  -- =====================================================
  -- PRODUCTS
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_PRODUCTS_NAME';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_PRODUCTS_NAME ON PRODUCTS(NAME)';
    DBMS_OUTPUT.PUT_LINE('Created IX_PRODUCTS_NAME on PRODUCTS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_PRODUCTS_NAME already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_PRODUCTS_IS_ACTIVE';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_PRODUCTS_IS_ACTIVE ON PRODUCTS(IS_ACTIVE)';
    DBMS_OUTPUT.PUT_LINE('Created IX_PRODUCTS_IS_ACTIVE on PRODUCTS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_PRODUCTS_IS_ACTIVE already exists, skipping');
  END IF;

  -- =====================================================
  -- TAXES
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_TAXES_NAME';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_TAXES_NAME ON TAXES(NAME)';
    DBMS_OUTPUT.PUT_LINE('Created IX_TAXES_NAME on TAXES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_TAXES_NAME already exists, skipping');
  END IF;

  -- =====================================================
  -- INVOICES (la tabla más crítica)
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_CLIENT_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_CLIENT_ID ON INVOICES(CLIENT_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICES_CLIENT_ID on INVOICES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICES_CLIENT_ID already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_USER_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_USER_ID ON INVOICES(USER_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICES_USER_ID on INVOICES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICES_USER_ID already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_ISSUE_DATE';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_ISSUE_DATE ON INVOICES(ISSUE_DATE)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICES_ISSUE_DATE on INVOICES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICES_ISSUE_DATE already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_STATUS';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_STATUS ON INVOICES(STATUS)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICES_STATUS on INVOICES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICES_STATUS already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_IS_ACTIVE';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_IS_ACTIVE ON INVOICES(IS_ACTIVE)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICES_IS_ACTIVE on INVOICES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICES_IS_ACTIVE already exists, skipping');
  END IF;

  -- Índice compuesto para paginación + filtro
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_ACTIVE_DATE';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_ACTIVE_DATE ON INVOICES(IS_ACTIVE, ISSUE_DATE DESC)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICES_ACTIVE_DATE on INVOICES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICES_ACTIVE_DATE already exists, skipping');
  END IF;

  -- =====================================================
  -- INVOICE_DETAILS
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICE_DETAILS_INVOICE_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICE_DETAILS_INVOICE_ID ON INVOICE_DETAILS(INVOICE_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICE_DETAILS_INVOICE_ID on INVOICE_DETAILS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICE_DETAILS_INVOICE_ID already exists, skipping');
  END IF;

  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICE_DETAILS_PRODUCT_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICE_DETAILS_PRODUCT_ID ON INVOICE_DETAILS(PRODUCT_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICE_DETAILS_PRODUCT_ID on INVOICE_DETAILS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICE_DETAILS_PRODUCT_ID already exists, skipping');
  END IF;

  -- =====================================================
  -- INVOICE_DETAIL_TAXES
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICE_DETAIL_TAXES_DETAIL_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICE_DETAIL_TAXES_DETAIL_ID ON INVOICE_DETAIL_TAXES(DETAIL_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_INVOICE_DETAIL_TAXES_DETAIL_ID on INVOICE_DETAIL_TAXES');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_INVOICE_DETAIL_TAXES_DETAIL_ID already exists, skipping');
  END IF;

  -- =====================================================
  -- STOCK_MOVEMENTS
  -- =====================================================
  
  SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_STOCK_MOVEMENTS_PRODUCT_ID';
  IF v_index_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE INDEX IX_STOCK_MOVEMENTS_PRODUCT_ID ON STOCK_MOVEMENTS(PRODUCT_ID)';
    DBMS_OUTPUT.PUT_LINE('Created IX_STOCK_MOVEMENTS_PRODUCT_ID on STOCK_MOVEMENTS');
  ELSE
    DBMS_OUTPUT.PUT_LINE('IX_STOCK_MOVEMENTS_PRODUCT_ID already exists, skipping');
  END IF;

  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('========================================');
  DBMS_OUTPUT.PUT_LINE('Indexes migration completed successfully!');
  DBMS_OUTPUT.PUT_LINE('========================================');

EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
    RAISE;
END;
/