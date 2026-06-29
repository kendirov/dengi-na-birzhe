# Migration Checklist

## Before

- [ ] Backup / branch DB
- [ ] Migration idempotent where possible
- [ ] Rollback SQL written
- [ ] No destructive DROP without approval

## SQL file

```sql
-- migrate:up
-- description: ...

-- migrate:down
-- rollback: ...
```

## After

- [ ] RLS policies updated
- [ ] Indexes created CONCURRENTLY if large table
- [ ] TypeScript types regenerated
- [ ] App queries updated
- [ ] EXPLAIN on hot queries

## Forbidden without approval

- TRUNCATE production tables
- DROP COLUMN in use
- Disable RLS
