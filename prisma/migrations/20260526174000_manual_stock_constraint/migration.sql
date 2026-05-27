ALTER TABLE products ADD CONSTRAINT stock_not_negative CHECK (stock >= 0);
