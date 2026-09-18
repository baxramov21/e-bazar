-- ============================================================
-- Migration: 004_fix_rls_recursion
-- Bozor-Analitika MVP — Fix profiles RLS recursion & insert
-- ============================================================

-- 1. Drop the recursive admin policy
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

-- 2. Allow users to insert their own profile during registration
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create a SECURITY DEFINER function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Re-create the admin policy using the secure function
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());
