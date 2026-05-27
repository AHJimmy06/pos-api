-- CreateIndex
CREATE INDEX "invoice_detail_taxes_detail_id_idx" ON "invoice_detail_taxes"("detail_id");

-- CreateIndex
CREATE INDEX "invoice_detail_taxes_tax_id_idx" ON "invoice_detail_taxes"("tax_id");

-- CreateIndex
CREATE INDEX "invoice_details_invoice_id_idx" ON "invoice_details"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_details_product_id_idx" ON "invoice_details"("product_id");

-- CreateIndex
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");

-- CreateIndex
CREATE INDEX "invoices_user_id_idx" ON "invoices"("user_id");

-- CreateIndex
CREATE INDEX "invoices_issue_date_idx" ON "invoices"("issue_date");

-- CreateIndex
CREATE INDEX "product_taxes_product_id_idx" ON "product_taxes"("product_id");

-- CreateIndex
CREATE INDEX "product_taxes_tax_id_idx" ON "product_taxes"("tax_id");

-- CreateIndex
CREATE INDEX "products_is_active_stock_idx" ON "products"("is_active", "stock");

-- CreateIndex
CREATE INDEX "stock_movements_product_id_idx" ON "stock_movements"("product_id");

-- CreateIndex
CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements"("created_at");
