DO $$
BEGIN
  -- Tables
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='addresses') THEN
    RAISE EXCEPTION 'Missing table: addresses';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='notifications') THEN
    RAISE EXCEPTION 'Missing table: notifications';
  END IF;

  -- Enums (case-insensitive check)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'orderstatus') THEN
    RAISE EXCEPTION 'Missing enum type: OrderStatus';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'productstatus') THEN
    RAISE EXCEPTION 'Missing enum type: ProductStatus';
  END IF;

  -- Indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_addresses_customer') THEN
    RAISE EXCEPTION 'Missing index: idx_addresses_customer';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_notifications_user') THEN
    RAISE EXCEPTION 'Missing index: idx_notifications_user';
  END IF;

  -- Foreign key constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_addresses_customer') THEN
    RAISE EXCEPTION 'Missing FK constraint: fk_addresses_customer';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user') THEN
    RAISE EXCEPTION 'Missing FK constraint: fk_notifications_user';
  END IF;

  -- A few sample FK checks from earlier changes
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_detail_order') THEN
    RAISE EXCEPTION 'Missing FK constraint: fk_order_detail_order';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_detail_product') THEN
    RAISE EXCEPTION 'Missing FK constraint: fk_order_detail_product';
  END IF;

  -- If we reach here, everything exists
END$$;
