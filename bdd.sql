CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    address VARCHAR(255),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    price DECIMAL(12,2),
    stock INTEGER
);

CREATE TABLE taxes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    current_rate DECIMAL(5,2)
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal_snapshot DECIMAL(12,2),
    tax_total_snapshot DECIMAL(12,2),
    total_snapshot DECIMAL(12,2),
    transaction_id VARCHAR(255)
);

CREATE TABLE invoice_details (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price_snapshot DECIMAL(12,2)
);

CREATE TABLE invoice_detail_taxes (
    id SERIAL PRIMARY KEY,
    detail_id INTEGER REFERENCES invoice_details(id),
    tax_id INTEGER REFERENCES taxes(id),
    rate_snapshot DECIMAL(5,2),
    calculated_amount_snapshot DECIMAL(12,2)
);