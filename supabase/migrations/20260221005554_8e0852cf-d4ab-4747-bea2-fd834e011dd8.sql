
-- Make is_admin() bypass RLS to avoid circular dependency
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

-- Add a permissive SELECT policy so authenticated users can check their own row
CREATE POLICY "authenticated_check_own_admin"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
