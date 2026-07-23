DO $$
DECLARE
  r record;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='_prisma_migrations') THEN
    FOR r IN SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='_prisma_migrations' ORDER BY ordinal_position LOOP
      RAISE NOTICE 'col: % (% )', r.column_name, r.data_type;
    END LOOP;
  ELSE
    RAISE NOTICE '_prisma_migrations not found';
  END IF;
END$$;