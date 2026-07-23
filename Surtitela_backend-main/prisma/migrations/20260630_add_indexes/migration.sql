-- Migration: add indexes for FK columns
BEGIN;

CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON "deliveries" ("id_customer");
CREATE INDEX IF NOT EXISTS idx_deliveries_employee ON "deliveries" ("id_employee");
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON "deliveries" ("id_order");

CREATE INDEX IF NOT EXISTS idx_orders_customer ON "orders" ("id_customer");

CREATE INDEX IF NOT EXISTS idx_orders_details_order ON "orders_details" ("id_order");
CREATE INDEX IF NOT EXISTS idx_orders_details_product ON "orders_details" ("id_product");

CREATE INDEX IF NOT EXISTS idx_payments_order ON "payments" ("id_order");

CREATE INDEX IF NOT EXISTS idx_production_details_production ON "production_details" ("id_production");

CREATE INDEX IF NOT EXISTS idx_productions_product ON "productions" ("id_product");
CREATE INDEX IF NOT EXISTS idx_productions_workshop ON "productions" ("id_workshop");

CREATE INDEX IF NOT EXISTS idx_products_category ON "products" ("id_product_category");

CREATE INDEX IF NOT EXISTS idx_purchasing_details_purchase ON "purchasing_details" ("id_purchase");
CREATE INDEX IF NOT EXISTS idx_purchasing_details_product ON "purchasing_details" ("id_product");

CREATE INDEX IF NOT EXISTS idx_returns_details_return ON "returns_details" ("id_return");
CREATE INDEX IF NOT EXISTS idx_returns_details_product ON "returns_details" ("id_product");

CREATE INDEX IF NOT EXISTS idx_sales_customer ON "sales" ("id_customer");
CREATE INDEX IF NOT EXISTS idx_sales_order ON "sales" ("id_order");

CREATE INDEX IF NOT EXISTS idx_sales_details_sale ON "sales_details" ("id_sale");
CREATE INDEX IF NOT EXISTS idx_sales_details_product ON "sales_details" ("id_product");

CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON "purchases" ("id_supplier");

CREATE INDEX IF NOT EXISTS idx_supplies_category ON "supplies" ("id_product_category");

COMMIT;
