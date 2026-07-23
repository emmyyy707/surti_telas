-- Check Prisma migrations tables
SELECT 'prisma_migrations' as source, * FROM "prisma_migrations" LIMIT 50;
SELECT '_prisma_migrations' as source, * FROM "_prisma_migrations" LIMIT 50;
-- Show failed migration records
SELECT * FROM "_prisma_migration_lock" LIMIT 10;
SELECT * FROM "_prisma_migrations" WHERE status IS NOT NULL ORDER BY finished_at DESC LIMIT 20;
