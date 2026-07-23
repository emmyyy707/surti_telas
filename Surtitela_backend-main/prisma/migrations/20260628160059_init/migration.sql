-- CreateTable
CREATE TABLE "customers" (
    "id_customer" SERIAL NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "id_user" INTEGER,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id_customer")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id_delivery" SERIAL NOT NULL,
    "total" DECIMAL(10,2),
    "address" VARCHAR(150),
    "city" VARCHAR(100),
    "phone" VARCHAR(20),
    "id_customer" INTEGER,
    "id_employee" INTEGER,
    "id_order" INTEGER,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id_delivery")
);

-- CreateTable
CREATE TABLE "documents_type" (
    "id_document_type" SERIAL NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,

    CONSTRAINT "documents_type_pkey" PRIMARY KEY ("id_document_type")
);

-- CreateTable
CREATE TABLE "employees" (
    "id_employee" SERIAL NOT NULL,
    "hire_date" DATE,
    "salary" DECIMAL(10,2),
    "status" BOOLEAN DEFAULT true,
    "id_user" INTEGER,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id_employee")
);

-- CreateTable
CREATE TABLE "orders" (
    "id_order" SERIAL NOT NULL,
    "order_date" DATE,
    "quantity" INTEGER,
    "subtotal" DECIMAL(10,2),
    "total" DECIMAL(10,2),
    "status" BOOLEAN DEFAULT true,
    "id_customer" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id_order")
);

-- CreateTable
CREATE TABLE "orders_details" (
    "id_order_detail" SERIAL NOT NULL,
    "id_order" INTEGER,
    "id_product" INTEGER,
    "quantity" INTEGER,
    "unit_value" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),

    CONSTRAINT "orders_details_pkey" PRIMARY KEY ("id_order_detail")
);

-- CreateTable
CREATE TABLE "payments" (
    "id_payment" SERIAL NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "id_order" INTEGER,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id_payment")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id_permission" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id_permission")
);

-- CreateTable
CREATE TABLE "production_details" (
    "id_production_detail" SERIAL NOT NULL,
    "quantity_delivered" INTEGER,
    "amount_received" INTEGER,
    "date_received" DATE,
    "delivery_date" DATE,
    "status" BOOLEAN DEFAULT true,
    "id_production" INTEGER,

    CONSTRAINT "production_details_pkey" PRIMARY KEY ("id_production_detail")
);

-- CreateTable
CREATE TABLE "productions" (
    "id_production" SERIAL NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "id_workshop" INTEGER,
    "id_product" INTEGER,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id_production")
);

-- CreateTable
CREATE TABLE "products" (
    "id_product" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255),
    "imagen" TEXT,
    "stock" INTEGER DEFAULT 0,
    "status" BOOLEAN DEFAULT true,
    "id_product_category" INTEGER,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id_product")
);

-- CreateTable
CREATE TABLE "products_category" (
    "id_product_category" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "products_category_pkey" PRIMARY KEY ("id_product_category")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id_purchase" SERIAL NOT NULL,
    "purchase_date" DATE NOT NULL,
    "total" DECIMAL(10,2),
    "status" BOOLEAN DEFAULT true,
    "id_supplier" INTEGER,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id_purchase")
);

-- CreateTable
CREATE TABLE "purchasing_details" (
    "id_purchase_detail" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_value" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2),
    "id_purchase" INTEGER,
    "id_product" INTEGER,

    CONSTRAINT "purchasing_details_pkey" PRIMARY KEY ("id_purchase_detail")
);

-- CreateTable
CREATE TABLE "returns" (
    "id_return" SERIAL NOT NULL,
    "return_date" DATE NOT NULL,
    "reason" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "id_order" INTEGER,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id_return")
);

-- CreateTable
CREATE TABLE "returns_details" (
    "id_return_detail" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2),
    "id_return" INTEGER,
    "id_product" INTEGER,

    CONSTRAINT "returns_details_pkey" PRIMARY KEY ("id_return_detail")
);

-- CreateTable
CREATE TABLE "roles" (
    "id_role" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "id_permission" INTEGER,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "sales" (
    "id_sale" SERIAL NOT NULL,
    "sale_date" DATE,
    "quantity" INTEGER,
    "unit_value" DECIMAL(10,2),
    "vat_value" DECIMAL(10,2),
    "discount_value" DECIMAL(10,2),
    "total_value" DECIMAL(10,2),
    "status" BOOLEAN DEFAULT true,
    "id_customer" INTEGER,
    "id_order" INTEGER,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id_sale")
);

-- CreateTable
CREATE TABLE "sales_details" (
    "id_sale_detail" SERIAL NOT NULL,
    "id_sale" INTEGER,
    "id_product" INTEGER,
    "quantity" INTEGER,
    "unit_value" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),

    CONSTRAINT "sales_details_pkey" PRIMARY KEY ("id_sale_detail")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id_supplier" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "address" VARCHAR(150),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id_supplier")
);

-- CreateTable
CREATE TABLE "supplies" (
    "id_supply" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "stock" INTEGER DEFAULT 0,
    "status" BOOLEAN DEFAULT true,
    "id_product_category" INTEGER,

    CONSTRAINT "supplies_pkey" PRIMARY KEY ("id_supply")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "address" VARCHAR(150),
    "status" BOOLEAN DEFAULT true,
    "id_document_type" INTEGER,
    "id_role" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id_workshop" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "address" VARCHAR(150),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id_workshop")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_user_key" ON "customers"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "employees_id_user_key" ON "employees"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "fk_customers_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_customer" FOREIGN KEY ("id_customer") REFERENCES "customers"("id_customer") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_employee" FOREIGN KEY ("id_employee") REFERENCES "employees"("id_employee") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_order" FOREIGN KEY ("id_order") REFERENCES "orders"("id_order") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "fk_employees_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "fk_orders_customer" FOREIGN KEY ("id_customer") REFERENCES "customers"("id_customer") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders_details" ADD CONSTRAINT "fk_order_detail_order" FOREIGN KEY ("id_order") REFERENCES "orders"("id_order") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders_details" ADD CONSTRAINT "fk_order_detail_product" FOREIGN KEY ("id_product") REFERENCES "products"("id_product") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_order" FOREIGN KEY ("id_order") REFERENCES "orders"("id_order") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production_details" ADD CONSTRAINT "fk_production_detail_production" FOREIGN KEY ("id_production") REFERENCES "productions"("id_production") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "fk_production_product" FOREIGN KEY ("id_product") REFERENCES "products"("id_product") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "fk_production_workshop" FOREIGN KEY ("id_workshop") REFERENCES "workshops"("id_workshop") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "fk_products_category" FOREIGN KEY ("id_product_category") REFERENCES "products_category"("id_product_category") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "fk_purchases_supplier" FOREIGN KEY ("id_supplier") REFERENCES "suppliers"("id_supplier") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchasing_details" ADD CONSTRAINT "fk_purchase_detail_product" FOREIGN KEY ("id_product") REFERENCES "products"("id_product") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchasing_details" ADD CONSTRAINT "fk_purchase_detail_purchase" FOREIGN KEY ("id_purchase") REFERENCES "purchases"("id_purchase") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "fk_returns_order" FOREIGN KEY ("id_order") REFERENCES "orders"("id_order") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "returns_details" ADD CONSTRAINT "fk_return_detail_product" FOREIGN KEY ("id_product") REFERENCES "products"("id_product") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "returns_details" ADD CONSTRAINT "fk_return_detail_return" FOREIGN KEY ("id_return") REFERENCES "returns"("id_return") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "fk_roles_permission" FOREIGN KEY ("id_permission") REFERENCES "permissions"("id_permission") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "fk_sales_customer" FOREIGN KEY ("id_customer") REFERENCES "customers"("id_customer") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "fk_sales_order" FOREIGN KEY ("id_order") REFERENCES "orders"("id_order") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_details" ADD CONSTRAINT "fk_sales_detail_product" FOREIGN KEY ("id_product") REFERENCES "products"("id_product") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_details" ADD CONSTRAINT "fk_sales_detail_sale" FOREIGN KEY ("id_sale") REFERENCES "sales"("id_sale") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplies" ADD CONSTRAINT "fk_supplies_category" FOREIGN KEY ("id_product_category") REFERENCES "products_category"("id_product_category") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_document_type" FOREIGN KEY ("id_document_type") REFERENCES "documents_type"("id_document_type") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE NO ACTION ON UPDATE NO ACTION;
