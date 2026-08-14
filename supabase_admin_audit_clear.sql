-- Crochet by Alae — Super Admin-only audit log clearing
-- Apply after supabase_admin_audit.sql. The database role check is authoritative.

create or replace function public.clear_admin_audit_log()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  if not public.is_super_admin_user() then
    raise exception 'Only the Super Admin can clear the admin audit log';
  end if;

  delete from public.admin_audit_log
  where id is not null;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.clear_admin_audit_log() from public;
grant execute on function public.clear_admin_audit_log() to authenticated;
