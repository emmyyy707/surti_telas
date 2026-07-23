-- Inspect all database objects: tables, enums, indexes, constraints, triggers
DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '--- Tables in public schema ---';
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename LOOP
    RAISE NOTICE '%', r.tablename;
  END LOOP;

  RAISE NOTICE '--- Enums and values ---';
  FOR r IN SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder LOOP
    RAISE NOTICE '%: %', r.typname, r.enumlabel;
  END LOOP;

  RAISE NOTICE '--- Indexes ---';
  FOR r IN SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname LOOP
    RAISE NOTICE '% on % => %', r.indexname, r.tablename, r.indexdef;
  END LOOP;

  RAISE NOTICE '--- Constraints (PK/FK/UNIQUE/CHECK) ---';
  FOR r IN SELECT conname, contype, conrelid::regclass::text AS table_name FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY conrelid::regclass::text LOOP
    RAISE NOTICE '% (% ) on %', r.conname, r.contype, r.table_name;
  END LOOP;

  RAISE NOTICE '--- Foreign key details ---';
  FOR r IN
    SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name
  LOOP
    RAISE NOTICE 'FK %: %.% -> %.%', r.constraint_name, r.table_name, r.column_name, r.foreign_table_name, r.foreign_column_name;
  END LOOP;

  RAISE NOTICE '--- Triggers (user-defined) ---';
  FOR r IN SELECT tgname, tgrelid::regclass::text AS table_name FROM pg_trigger WHERE NOT tgisinternal ORDER BY tgrelid::regclass::text, tgname LOOP
    RAISE NOTICE '% on %', r.tgname, r.table_name;
  END LOOP;
END$$;
