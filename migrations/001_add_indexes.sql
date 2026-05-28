-- =====================================================
-- MIGRACIÓN: Agregar índices para optimizar consultas
-- Fecha: 2026-05-28
-- Base de datos: Oracle
-- =====================================================
-- Script idempotente - safe para ejecutar múltiples veces
-- =====================================================

SET SERVEROUTPUT ON;

DECLARE
  v_index_count NUMBER;
  v_sql VARCHAR2(500);
BEGIN
  DBMS_OUTPUT.PUT_LINE('Starting indexes migration...');
  DBMS_OUTPUT.PUT_LINE('');

  -- Helper macro para crear índice si no existe
  -- Usamos un bloque anónimo para capturar el error ORA-01408
  
  -- =====================================================
  -- CLIENTS
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_CLIENTS_EMAIL';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_CLIENTS_EMAIL ON CLIENTS(EMAIL)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_CLIENTS_EMAIL on CLIENTS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_CLIENTS_EMAIL already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_CLIENTS_EMAIL already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_CLIENTS_EMAIL: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_CLIENTS_IS_ACTIVE';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_CLIENTS_IS_ACTIVE ON CLIENTS(IS_ACTIVE)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_CLIENTS_IS_ACTIVE on CLIENTS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_CLIENTS_IS_ACTIVE already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_CLIENTS_IS_ACTIVE already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_CLIENTS_IS_ACTIVE: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- USERS
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USERS_EMAIL';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_USERS_EMAIL ON USERS(EMAIL)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_USERS_EMAIL on USERS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_USERS_EMAIL already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_USERS_EMAIL already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_USERS_EMAIL: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USERS_USERNAME';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_USERS_USERNAME ON USERS(USERNAME)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_USERS_USERNAME on USERS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_USERS_USERNAME already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_USERS_USERNAME already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_USERS_USERNAME: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USERS_IS_ACTIVE';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_USERS_IS_ACTIVE ON USERS(IS_ACTIVE)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_USERS_IS_ACTIVE on USERS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_USERS_IS_ACTIVE already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_USERS_IS_ACTIVE already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_USERS_IS_ACTIVE: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- USER_ROLES
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USER_ROLES_USER_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_USER_ROLES_USER_ID ON USER_ROLES(USER_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_USER_ROLES_USER_ID on USER_ROLES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_USER_ROLES_USER_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_USER_ROLES_USER_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_USER_ROLES_USER_ID: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_USER_ROLES_ROLE_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_USER_ROLES_ROLE_ID ON USER_ROLES(ROLE_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_USER_ROLES_ROLE_ID on USER_ROLES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_USER_ROLES_ROLE_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_USER_ROLES_ROLE_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_USER_ROLES_ROLE_ID: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- PRODUCTS
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_PRODUCTS_NAME';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_PRODUCTS_NAME ON PRODUCTS(NAME)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_PRODUCTS_NAME on PRODUCTS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_PRODUCTS_NAME already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_PRODUCTS_NAME already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_PRODUCTS_NAME: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_PRODUCTS_IS_ACTIVE';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_PRODUCTS_IS_ACTIVE ON PRODUCTS(IS_ACTIVE)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_PRODUCTS_IS_ACTIVE on PRODUCTS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_PRODUCTS_IS_ACTIVE already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_PRODUCTS_IS_ACTIVE already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_PRODUCTS_IS_ACTIVE: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- TAXES
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_TAXES_NAME';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_TAXES_NAME ON TAXES(NAME)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_TAXES_NAME on TAXES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_TAXES_NAME already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_TAXES_NAME already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_TAXES_NAME: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- INVOICES
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_CLIENT_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_CLIENT_ID ON INVOICES(CLIENT_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICES_CLIENT_ID on INVOICES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_CLIENT_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_CLIENT_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICES_CLIENT_ID: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_USER_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_USER_ID ON INVOICES(USER_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICES_USER_ID on INVOICES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_USER_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_USER_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICES_USER_ID: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_ISSUE_DATE';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_ISSUE_DATE ON INVOICES(ISSUE_DATE)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICES_ISSUE_DATE on INVOICES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_ISSUE_DATE already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_ISSUE_DATE already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICES_ISSUE_DATE: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_STATUS';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_STATUS ON INVOICES(STATUS)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICES_STATUS on INVOICES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_STATUS already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_STATUS already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICES_STATUS: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_IS_ACTIVE';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_IS_ACTIVE ON INVOICES(IS_ACTIVE)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICES_IS_ACTIVE on INVOICES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_IS_ACTIVE already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_IS_ACTIVE already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICES_IS_ACTIVE: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICES_ACTIVE_DATE';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICES_ACTIVE_DATE ON INVOICES(IS_ACTIVE, ISSUE_DATE DESC)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICES_ACTIVE_DATE on INVOICES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_ACTIVE_DATE already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICES_ACTIVE_DATE already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICES_ACTIVE_DATE: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- INVOICE_DETAILS
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICE_DETAILS_INVOICE_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICE_DETAILS_INVOICE_ID ON INVOICE_DETAILS(INVOICE_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICE_DETAILS_INVOICE_ID on INVOICE_DETAILS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICE_DETAILS_INVOICE_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICE_DETAILS_INVOICE_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICE_DETAILS_INVOICE_ID: ' || SQLERRM);
    END IF;
  END;

  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICE_DETAILS_PRODUCT_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICE_DETAILS_PRODUCT_ID ON INVOICE_DETAILS(PRODUCT_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICE_DETAILS_PRODUCT_ID on INVOICE_DETAILS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICE_DETAILS_PRODUCT_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICE_DETAILS_PRODUCT_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICE_DETAILS_PRODUCT_ID: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- INVOICE_DETAIL_TAXES
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_INVOICE_DETAIL_TAXES_DETAIL_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_INVOICE_DETAIL_TAXES_DETAIL_ID ON INVOICE_DETAIL_TAXES(DETAIL_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_INVOICE_DETAIL_TAXES_DETAIL_ID on INVOICE_DETAIL_TAXES');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICE_DETAIL_TAXES_DETAIL_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_INVOICE_DETAIL_TAXES_DETAIL_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_INVOICE_DETAIL_TAXES_DETAIL_ID: ' || SQLERRM);
    END IF;
  END;

  -- =====================================================
  -- STOCK_MOVEMENTS
  -- =====================================================
  
  BEGIN
    SELECT COUNT(*) INTO v_index_count FROM user_indexes WHERE index_name = 'IX_STOCK_MOVEMENTS_PRODUCT_ID';
    IF v_index_count = 0 THEN
      EXECUTE IMMEDIATE 'CREATE INDEX IX_STOCK_MOVEMENTS_PRODUCT_ID ON STOCK_MOVEMENTS(PRODUCT_ID)';
      DBMS_OUTPUT.PUT_LINE('✓ Created IX_STOCK_MOVEMENTS_PRODUCT_ID on STOCK_MOVEMENTS');
    ELSE
      DBMS_OUTPUT.PUT_LINE('○ IX_STOCK_MOVEMENTS_PRODUCT_ID already exists');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1408 THEN
      DBMS_OUTPUT.PUT_LINE('○ IX_STOCK_MOVEMENTS_PRODUCT_ID already exists (ORA-01408)');
    ELSE
      DBMS_OUTPUT.PUT_LINE('⚠ IX_STOCK_MOVEMENTS_PRODUCT_ID: ' || SQLERRM);
    END IF;
  END;

  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('========================================');
  DBMS_OUTPUT.PUT_LINE('Indexes migration completed!');
  DBMS_OUTPUT.PUT_LINE('========================================');

END;
/
