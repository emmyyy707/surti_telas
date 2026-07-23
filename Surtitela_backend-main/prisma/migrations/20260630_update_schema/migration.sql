-- Migration: Add enums OrderStatus/ProductStatus, add status_enum columns, add addresses and notifications, backfill values, and adjust FK cascade where appropriate

BEGIN;

-- Create enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orderstatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM ('Nuevo','EnProduccion','Listo','Despachado','EnCamino','Entregado','Cancelado');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'productstatus') THEN
        CREATE TYPE "ProductStatus" AS ENUM ('Publicado','Borrador');
    END IF;
END $$;

-- Add new status_enum columns if missing
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "status_enum" "OrderStatus" DEFAULT 'Nuevo'::"OrderStatus";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "status_enum" "ProductStatus" DEFAULT 'Publicado'::"ProductStatus";

-- Backfill status_enum from boolean status (safe, non-destructive)
UPDATE "orders" SET "status_enum" = CASE WHEN "status" IS TRUE THEN 'Nuevo'::"OrderStatus" ELSE 'Cancelado'::"OrderStatus" END WHERE "status_enum" IS NULL;
UPDATE "products" SET "status_enum" = CASE WHEN "status" IS TRUE THEN 'Publicado'::"ProductStatus" ELSE 'Borrador'::"ProductStatus" END WHERE "status_enum" IS NULL;

-- Create addresses table
CREATE TABLE IF NOT EXISTS "addresses" (
  "id_address" SERIAL PRIMARY KEY,
  "street" VARCHAR(150) NOT NULL,
  "city" VARCHAR(100),
  "phone" VARCHAR(20),
  "id_customer" INTEGER
);

-- Add FK for addresses -> customers
ALTER TABLE "addresses"
  DROP CONSTRAINT IF EXISTS "fk_addresses_customer";
ALTER TABLE "addresses"
  ADD CONSTRAINT "fk_addresses_customer" FOREIGN KEY ("id_customer") REFERENCES "customers" ("id_customer") ON DELETE CASCADE;

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id_notification" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "body" TEXT,
  "read" BOOLEAN DEFAULT false,
  "id_user" INTEGER,
  "created_at" TIMESTAMP(6) DEFAULT now()
);

-- Add FK for notifications -> users
ALTER TABLE "notifications"
  DROP CONSTRAINT IF EXISTS "fk_notifications_user";
ALTER TABLE "notifications"
  ADD CONSTRAINT "fk_notifications_user" FOREIGN KEY ("id_user") REFERENCES "users" ("id_user") ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_addresses_customer" ON "addresses" ("id_customer");
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications" ("id_user");

-- Adjust existing foreign keys to ON DELETE CASCADE where we changed relations in schema
-- For each constraint we drop and re-add with CASCADE. Names match those created by initial migration.

-- deliveries
ALTER TABLE "deliveries" DROP CONSTRAINT IF EXISTS "fk_deliveries_customer";
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_customer" FOREIGN KEY ("id_customer") REFERENCES "customers" ("id_customer") ON DELETE CASCADE;
ALTER TABLE "deliveries" DROP CONSTRAINT IF EXISTS "fk_deliveries_employee";
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_employee" FOREIGN KEY ("id_employee") REFERENCES "employees" ("id_employee") ON DELETE CASCADE;
ALTER TABLE "deliveries" DROP CONSTRAINT IF EXISTS "fk_deliveries_order";
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_order" FOREIGN KEY ("id_order") REFERENCES "orders" ("id_order") ON DELETE CASCADE;

-- employees -> users
ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "fk_employees_user";
ALTER TABLE "employees" ADD CONSTRAINT "fk_employees_user" FOREIGN KEY ("id_user") REFERENCES "users" ("id_user") ON DELETE CASCADE;

-- orders -> customer
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "fk_orders_customer";
ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_customer" FOREIGN KEY ("id_customer") REFERENCES "customers" ("id_customer") ON DELETE CASCADE;

-- orders_details
ALTER TABLE "orders_details" DROP CONSTRAINT IF EXISTS "fk_order_detail_order";
ALTER TABLE "orders_details" ADD CONSTRAINT "fk_order_detail_order" FOREIGN KEY ("id_order") REFERENCES "orders" ("id_order") ON DELETE CASCADE;
ALTER TABLE "orders_details" DROP CONSTRAINT IF EXISTS "fk_order_detail_product";
ALTER TABLE "orders_details" ADD CONSTRAINT "fk_order_detail_product" FOREIGN KEY ("id_product") REFERENCES "products" ("id_product") ON DELETE CASCADE;

-- payments -> orders
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "fk_payments_order";
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_order" FOREIGN KEY ("id_order") REFERENCES "orders" ("id_order") ON DELETE CASCADE;

-- production_details
ALTER TABLE "production_details" DROP CONSTRAINT IF EXISTS "fk_production_detail_production";
ALTER TABLE "production_details" ADD CONSTRAINT "fk_production_detail_production" FOREIGN KEY ("id_production") REFERENCES "productions" ("id_production") ON DELETE CASCADE;

-- productions
ALTER TABLE "productions" DROP CONSTRAINT IF EXISTS "fk_production_product";
ALTER TABLE "productions" ADD CONSTRAINT "fk_production_product" FOREIGN KEY ("id_product") REFERENCES "products" ("id_product") ON DELETE CASCADE;
ALTER TABLE "productions" DROP CONSTRAINT IF EXISTS "fk_production_workshop";
ALTER TABLE "productions" ADD CONSTRAINT "fk_production_workshop" FOREIGN KEY ("id_workshop") REFERENCES "workshops" ("id_workshop") ON DELETE CASCADE;

-- purchasing_details
ALTER TABLE "purchasing_details" DROP CONSTRAINT IF EXISTS "fk_purchase_detail_product";
ALTER TABLE "purchasing_details" ADD CONSTRAINT "fk_purchase_detail_product" FOREIGN KEY ("id_product") REFERENCES "products" ("id_product") ON DELETE CASCADE;
ALTER TABLE "purchasing_details" DROP CONSTRAINT IF EXISTS "fk_purchase_detail_purchase";
ALTER TABLE "purchasing_details" ADD CONSTRAINT "fk_purchase_detail_purchase" FOREIGN KEY ("id_purchase") REFERENCES "purchases" ("id_purchase") ON DELETE CASCADE;

-- returns & returns_details
ALTER TABLE "returns" DROP CONSTRAINT IF EXISTS "fk_returns_order";
ALTER TABLE "returns" ADD CONSTRAINT "fk_returns_order" FOREIGN KEY ("id_order") REFERENCES "orders" ("id_order") ON DELETE CASCADE;
ALTER TABLE "returns_details" DROP CONSTRAINT IF EXISTS "fk_return_detail_product";
ALTER TABLE "returns_details" ADD CONSTRAINT "fk_return_detail_product" FOREIGN KEY ("id_product") REFERENCES "products" ("id_product") ON DELETE CASCADE;
ALTER TABLE "returns_details" DROP CONSTRAINT IF EXISTS "fk_return_detail_return";
ALTER TABLE "returns_details" ADD CONSTRAINT "fk_return_detail_return" FOREIGN KEY ("id_return") REFERENCES "returns" ("id_return") ON DELETE CASCADE;

-- sales and details
ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "fk_sales_customer";
ALTER TABLE "sales" ADD CONSTRAINT "fk_sales_customer" FOREIGN KEY ("id_customer") REFERENCES "customers" ("id_customer") ON DELETE CASCADE;
ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "fk_sales_order";
ALTER TABLE "sales" ADD CONSTRAINT "fk_sales_order" FOREIGN KEY ("id_order") REFERENCES "orders" ("id_order") ON DELETE CASCADE;
ALTER TABLE "sales_details" DROP CONSTRAINT IF EXISTS "fk_sales_detail_product";
ALTER TABLE "sales_details" ADD CONSTRAINT "fk_sales_detail_product" FOREIGN KEY ("id_product") REFERENCES "products" ("id_product") ON DELETE CASCADE;
ALTER TABLE "sales_details" DROP CONSTRAINT IF EXISTS "fk_sales_detail_sale";
ALTER TABLE "sales_details" ADD CONSTRAINT "fk_sales_detail_sale" FOREIGN KEY ("id_sale") REFERENCES "sales" ("id_sale") ON DELETE CASCADE;

-- supplies
ALTER TABLE "supplies" DROP CONSTRAINT IF EXISTS "fk_supplies_category";
ALTER TABLE "supplies" ADD CONSTRAINT "fk_supplies_category" FOREIGN KEY ("id_product_category") REFERENCES "products_category" ("id_product_category") ON DELETE CASCADE;

-- users foreign keys
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_users_document_type";
ALTER TABLE "users" ADD CONSTRAINT "fk_users_document_type" FOREIGN KEY ("id_document_type") REFERENCES "documents_type" ("id_document_type") ON DELETE CASCADE;
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_users_role";
ALTER TABLE "users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("id_role") REFERENCES "roles" ("id_role") ON DELETE CASCADE;

COMMIT;
