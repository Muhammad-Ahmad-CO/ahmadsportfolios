DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.contact_messages FROM authenticated, anon;
GRANT ALL ON public.contact_messages TO service_role;