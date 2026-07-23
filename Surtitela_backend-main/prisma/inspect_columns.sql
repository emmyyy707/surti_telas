-- List columns for _prisma_migrations
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='_prisma_migrations' ORDER BY ordinal_position;