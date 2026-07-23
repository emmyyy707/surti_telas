DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='_prisma_migrations') THEN
    RAISE NOTICE 'FOUND _prisma_migrations';
  ELSE
    RAISE NOTICE 'NO _prisma_migrations';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='prisma_migrations') THEN
    RAISE NOTICE 'FOUND prisma_migrations';
  ELSE
    RAISE NOTICE 'NO prisma_migrations';
  END IF;
END$$;

-- If _prisma_migrations exists, print last 20 entries
DO $$
DECLARE
  rec record;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='_prisma_migrations') THEN
    FOR rec IN SELECT id, migration_name, status, started_at, finished_at, logs FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 20 LOOP
      RAISE NOTICE 'MIGRATION: id=% name=% status=% started_at=% finished_at=%', rec.id, rec.migration_name, rec.status, rec.started_at, rec.finished_at;
    END LOOP;
  ELSE
    RAISE NOTICE '_prisma_migrations missing, cannot list';
  END IF;
END$$;
