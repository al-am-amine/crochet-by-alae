/*
  Secure admin-user management endpoint.
  The service-role key must exist only in Supabase Edge Function secrets.
  This endpoint sends invitations and changes role/status metadata; it never
  accepts a password from the browser.
*/
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://crochetbyalae.netlify.app'

const adminClient = createClient(supabaseUrl, serviceRoleKey)

function headers(origin = appOrigin) {
  return {
    'Access-Control-Allow-Origin': origin === appOrigin ? origin : appOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }
}

function response(body: Record<string, unknown>, status = 200, origin = appOrigin) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) })
}

function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

function validRole(value: unknown) {
  return value === 'admin'
}

const ALLOWED_PERMISSIONS = new Set([
  'products.view', 'products.manage',
  'orders.view', 'orders.manage',
  'custom_requests.view', 'custom_requests.manage',
  'customers.view', 'customers.manage',
  'settings.manage', 'security_log.view', 'admin_users.manage',
])

function normalizePermissions(value: unknown) {
  if (!Array.isArray(value)) return ['products.view']
  return [...new Set(value.filter((item) => typeof item === 'string' && ALLOWED_PERMISSIONS.has(item)))]
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') ?? appOrigin
  if (request.method === 'OPTIONS') return new Response('ok', { headers: headers(origin) })
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405, origin)
  if (!supabaseUrl || !serviceRoleKey || !anonKey) return response({ error: 'Function secrets are not configured' }, 503, origin)

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return response({ error: 'Authentication required' }, 401, origin)

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  })
  const { data: userData, error: userError } = await callerClient.auth.getUser()
  const callerEmail = normalizeEmail(userData.user?.email)
  if (userError || !callerEmail) return response({ error: 'Authentication required' }, 401, origin)

  const { data: callerRole, error: roleError } = await adminClient
    .from('admin_users')
    .select('role, is_active, permissions')
    .eq('email', callerEmail)
    .maybeSingle()
  const callerCanManageUsers = callerRole?.role === 'super_admin' || (
    callerRole?.role === 'admin' &&
    callerRole?.is_active === true &&
    Array.isArray(callerRole?.permissions) &&
    callerRole.permissions.includes('admin_users.manage')
  )
  if (roleError || callerRole?.is_active !== true || !callerCanManageUsers) {
    return response({ error: 'User-management permission required' }, 403, origin)
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return response({ error: 'Invalid JSON body' }, 400, origin)
  }

  const email = normalizeEmail(body.email)
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return response({ error: 'Valid email is required' }, 400, origin)

  if (body.action === 'invite_user') {
    if (body.role === 'super_admin') return response({ error: 'Only the configured Super Admin may hold that role' }, 400, origin)
    const role = 'admin'
    const permissions = normalizePermissions(body.permissions)
    const { error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { admin_role: role },
    })
    if (authError) return response({ error: authError.message }, 400, origin)

    const { error: rowError } = await adminClient
      .from('admin_users')
      .upsert({ email, role, is_active: true, permissions }, { onConflict: 'email' })
    if (rowError) return response({ error: rowError.message }, 500, origin)
    return response({ ok: true, email, role }, 200, origin)
  }

  if (body.action === 'update_user') {
    if (email === callerEmail && body.is_active === false) {
      return response({ error: 'You cannot suspend your own Super Admin account' }, 400, origin)
    }
    if (email === callerEmail) return response({ error: 'You cannot change your own Super Admin account' }, 400, origin)
    if (body.role === 'super_admin') return response({ error: 'Only one Super Admin is allowed' }, 400, origin)

    const { data: target, error: targetError } = await adminClient
      .from('admin_users')
      .select('role')
      .eq('email', email)
      .maybeSingle()
    if (targetError) return response({ error: targetError.message }, 500, origin)
    if (!target) return response({ error: 'Admin account not found' }, 404, origin)
    if (target.role === 'super_admin') return response({ error: 'The sole Super Admin cannot be changed' }, 400, origin)

    const update: Record<string, unknown> = {}
    if (body.role !== undefined && validRole(body.role)) update.role = body.role
    if (typeof body.is_active === 'boolean') update.is_active = body.is_active
    if (Array.isArray(body.permissions)) update.permissions = normalizePermissions(body.permissions)
    if (!Object.keys(update).length) return response({ error: 'No supported change supplied' }, 400, origin)

    const { error: rowError } = await adminClient.from('admin_users').update(update).eq('email', email)
    if (rowError) return response({ error: rowError.message }, 500, origin)
    return response({ ok: true, email, ...update }, 200, origin)
  }

  if (body.action === 'remove_user') {
    if (email === callerEmail) return response({ error: 'You cannot remove your own Super Admin account' }, 400, origin)
    const { data: target, error: targetError } = await adminClient
      .from('admin_users')
      .select('role')
      .eq('email', email)
      .maybeSingle()
    if (targetError) return response({ error: targetError.message }, 500, origin)
    if (!target) return response({ error: 'Admin account not found' }, 404, origin)
    if (target.role === 'super_admin') return response({ error: 'The sole Super Admin cannot be removed' }, 400, origin)
    const { error: rowError } = await adminClient.from('admin_users').delete().eq('email', email)
    if (rowError) return response({ error: rowError.message }, 500, origin)
    return response({ ok: true, email, removed: true }, 200, origin)
  }

  return response({ error: 'Unsupported action' }, 400, origin)
})
