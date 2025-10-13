-- supabase/fix_profiles_auth.sql
-- Fixed SQL to resolve profiles table issues and enable auth flows
-- This script fixes the "CREATE POLICY IF NOT EXISTS" syntax error and provides safe policy creation

-- 1) Make sure pgcrypto exists (for UUID default if needed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Ensure commonly expected columns (additive ALTERs)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS is_seller boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3) Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4) Create policies with proper conditional checks (PostgreSQL doesn't support IF NOT EXISTS for policies)
DO $$
BEGIN
  -- Allow public SELECT on profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_public_select'
  ) THEN
    CREATE POLICY profiles_public_select ON public.profiles FOR SELECT USING (true);
  END IF;

  -- Allow authenticated users to INSERT their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_self'
  ) THEN
    CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- Allow authenticated users to UPDATE their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_self'
  ) THEN
    CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;

  -- Allow authenticated users to DELETE their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_delete_self'
  ) THEN
    CREATE POLICY profiles_delete_self ON public.profiles FOR DELETE USING (auth.uid() = id);
  END IF;
END
$$;

-- 5) Create function to auto-create profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_auth_user_create()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only insert if profile doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email, full_name, phone, user_type, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.user_metadata->>'full_name', ''),
      COALESCE(NEW.user_metadata->>'phone', ''),
      COALESCE(NEW.user_metadata->>'user_type', 'buyer'),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 6) Create trigger on auth.users (drop existing first to avoid conflicts)
DO $$
BEGIN
  -- Drop trigger if it exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'trigger_handle_auth_user_create' 
      AND c.relname = 'users' 
      AND n.nspname = 'auth'
  ) THEN
    DROP TRIGGER trigger_handle_auth_user_create ON auth.users;
  END IF;
  
  -- Create the trigger
  CREATE TRIGGER trigger_handle_auth_user_create 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_auth_user_create();
END
$$;

-- 7) Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles (user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

RAISE NOTICE 'Profiles table setup completed successfully. Users should now be able to sign up and sign in.';