-- supabase/ensure_profiles.sql
-- Safe, idempotent script to ensure `public.profiles` has the expected columns and defaults.
-- Review before running in Supabase SQL Editor. This script will NOT DROP data.

-- 1) Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Add commonly-needed columns (non-destructive)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS is_seller boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3) Add helpful indexes if not present
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles (full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_is_seller ON public.profiles (is_seller);

-- 4) If an 'id' column exists and is uuid, make sure it has a default generator
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
  ) THEN
    IF (SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
    ) = 'uuid' THEN
      -- Only set default; does not change existing values
      BEGIN
        EXECUTE 'ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()';
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not set default on profiles.id (may already have a default or incompatible type)';
      END;
    ELSE
      RAISE NOTICE 'profiles.id exists but is not uuid; skipping SET DEFAULT gen_random_uuid()';
    END IF;
  ELSE
    RAISE NOTICE 'profiles.id column does not exist; skipping DEFAULT setup. Consider adding an id uuid column manually if needed.';
  END IF;
END
$$;

-- 5) Conditionally add a primary key on id only when safe
DO $$
DECLARE
  has_pk boolean;
  null_count int;
  dup_count int;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'profiles' AND c.contype = 'p'
  ) INTO has_pk;

  IF NOT has_pk THEN
    -- Check for NULL ids
    EXECUTE 'SELECT count(*) FROM public.profiles WHERE id IS NULL' INTO null_count;

    -- Check for duplicate ids
    EXECUTE 'SELECT count(*) FROM (SELECT id FROM public.profiles GROUP BY id HAVING count(*) > 1) x' INTO dup_count;

    IF null_count > 0 THEN
      RAISE NOTICE 'profiles.id contains % NULL values - cannot add PRIMARY KEY. Fix data first.', null_count;
    ELSIF dup_count > 0 THEN
      RAISE NOTICE 'profiles.id contains % duplicate values - cannot add PRIMARY KEY. Fix data first.', dup_count;
    ELSE
      -- Safe to add PK
      BEGIN
        EXECUTE 'ALTER TABLE public.profiles ADD PRIMARY KEY (id)';
        RAISE NOTICE 'Primary key added on profiles.id';
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Failed to add primary key on profiles.id. Inspect data and constraints.';
      END;
    END IF;
  ELSE
    RAISE NOTICE 'profiles table already has a primary key. Skipping.';
  END IF;
END
$$;

-- 6) Guidance for enabling Row Level Security (RLS)
-- Do NOT enable RLS unless you also add appropriate policies. Below is an example you can run AFTER verifying table shape.
--
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "profiles_self_update" ON public.profiles
--   FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- CREATE POLICY "profiles_select_public" ON public.profiles
--   FOR SELECT USING (true);
--
-- Notes:
-- - If your app stores profile.id equal to auth.users.id (recommended), consider inserting profiles with id = auth.uid() on user creation.
-- - If your current id column is not UUID or doesn't map to Supabase Auth user ids, review and adapt the schema carefully.

-- 7) Final sanity notice
RAISE NOTICE 'profiles migration script completed. Review NOTICE messages above for any manual actions required.';
