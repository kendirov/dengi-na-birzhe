# RLS Checklist

## Every public table

- [ ] RLS enabled: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] Policy for SELECT (who can read?)
- [ ] Policy for INSERT/UPDATE/DELETE (who can write?)
- [ ] Service role only for admin ops
- [ ] Anon key cannot read sensitive data

## Patterns

```sql
-- User owns row
CREATE POLICY "users_read_own" ON table
  FOR SELECT USING (auth.uid() = user_id);
```

## Test

- [ ] Query as anon — should fail or return empty
- [ ] Query as authenticated user — expected rows only
- [ ] Supabase advisors: security warnings = 0 critical

## ScreenerPRO future tables (draft)

| Table | RLS |
|-------|-----|
| watchlists | user_id scoped |
| alerts | user_id scoped |
| market_snapshots | read public / write service |
