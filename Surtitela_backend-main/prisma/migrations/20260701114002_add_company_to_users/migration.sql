-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "fk_products_category";

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company" VARCHAR(100),
ADD COLUMN     "email_verification_token" VARCHAR(255),
ADD COLUMN     "email_verified" BOOLEAN DEFAULT false,
ADD COLUMN     "password_reset_expires" TIMESTAMP(6),
ADD COLUMN     "password_reset_token" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "fk_products_category" FOREIGN KEY ("id_product_category") REFERENCES "products_category"("id_product_category") ON DELETE CASCADE ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "idx_addresses_customer" RENAME TO "addresses_id_customer_idx";

-- RenameIndex
ALTER INDEX "idx_deliveries_customer" RENAME TO "deliveries_id_customer_idx";

-- RenameIndex
ALTER INDEX "idx_deliveries_employee" RENAME TO "deliveries_id_employee_idx";

-- RenameIndex
ALTER INDEX "idx_deliveries_order" RENAME TO "deliveries_id_order_idx";

-- RenameIndex
ALTER INDEX "idx_notifications_user" RENAME TO "notifications_id_user_idx";

-- RenameIndex
ALTER INDEX "idx_orders_customer" RENAME TO "orders_id_customer_idx";

-- RenameIndex
ALTER INDEX "idx_orders_details_order" RENAME TO "orders_details_id_order_idx";

-- RenameIndex
ALTER INDEX "idx_orders_details_product" RENAME TO "orders_details_id_product_idx";

-- RenameIndex
ALTER INDEX "idx_payments_order" RENAME TO "payments_id_order_idx";

-- RenameIndex
ALTER INDEX "idx_production_details_production" RENAME TO "production_details_id_production_idx";

-- RenameIndex
ALTER INDEX "idx_productions_product" RENAME TO "productions_id_product_idx";

-- RenameIndex
ALTER INDEX "idx_productions_workshop" RENAME TO "productions_id_workshop_idx";

-- RenameIndex
ALTER INDEX "idx_products_category" RENAME TO "products_id_product_category_idx";

-- RenameIndex
ALTER INDEX "idx_purchases_supplier" RENAME TO "purchases_id_supplier_idx";

-- RenameIndex
ALTER INDEX "idx_purchasing_details_product" RENAME TO "purchasing_details_id_product_idx";

-- RenameIndex
ALTER INDEX "idx_purchasing_details_purchase" RENAME TO "purchasing_details_id_purchase_idx";

-- RenameIndex
ALTER INDEX "idx_returns_details_product" RENAME TO "returns_details_id_product_idx";

-- RenameIndex
ALTER INDEX "idx_returns_details_return" RENAME TO "returns_details_id_return_idx";

-- RenameIndex
ALTER INDEX "idx_sales_customer" RENAME TO "sales_id_customer_idx";

-- RenameIndex
ALTER INDEX "idx_sales_order" RENAME TO "sales_id_order_idx";

-- RenameIndex
ALTER INDEX "idx_sales_details_product" RENAME TO "sales_details_id_product_idx";

-- RenameIndex
ALTER INDEX "idx_sales_details_sale" RENAME TO "sales_details_id_sale_idx";

-- RenameIndex
ALTER INDEX "idx_supplies_category" RENAME TO "supplies_id_product_category_idx";
