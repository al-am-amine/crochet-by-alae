-- Crochet by Alae — safe admin deletion controls
-- Orders are deleted only by an authenticated admin with orders.manage.
-- Products are deleted through a guarded function so historical orders retain
-- their product_name while product_id is detached instead of cascading.

drop policy if exists "Authenticated admin can delete orders" on public.orders;
create policy "Authenticated admin can delete orders"
  on public.orders
  for delete
  to authenticated
  using (public.is_admin_permission_allowed('orders.manage'));

create or replace function public.delete_product_safely(target_product_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  detached_order_count integer := 0;
  deleted_product_id uuid;
begin
  if not public.is_admin_permission_allowed('products.manage') then
    raise exception 'not_authorized';
  end if;

  if target_product_id is null then
    raise exception 'product_id_required';
  end if;

  update public.orders
  set product_id = null
  where product_id = target_product_id;

  get diagnostics detached_order_count = row_count;

  delete from public.products
  where id = target_product_id
  returning id into deleted_product_id;

  if deleted_product_id is null then
    raise exception 'product_not_found';
  end if;

  return jsonb_build_object(
    'product_id', deleted_product_id,
    'detached_orders', detached_order_count
  );
end;
$function$;

revoke all on function public.delete_product_safely(uuid) from public;
grant execute on function public.delete_product_safely(uuid) to authenticated;
