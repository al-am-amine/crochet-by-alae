/*
  Secure admin-user management endpoint.
  The service-role key must exist only in Supabase Edge Function secrets.
  This endpoint never accepts or stores a password from the browser.
*/
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const appOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://crochetbyalae.netlify.app'
const allowedOrigins = new Set([
  appOrigin,
  'https://crochetbyalae.netlify.app',
  'https://crochetbyalaa.netlify.app',
  'http://localhost:3000',
  'http://localhost:4176',
])

const adminClient = createClient(supabaseUrl, serviceRoleKey)

function headers(origin = appOrigin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : appOrigin,
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

function normalizePermissions(value: unknown, allowUserManagement = false) {
  if (!Array.isArray(value)) return ['products.view']
  const permissions = [...new Set(value.filter((item) => typeof item === 'string' && ALLOWED_PERMISSIONS.has(item)))]
  return allowUserManagement || permissions.length === 0
    ? permissions.length ? permissions : ['products.view']
    : permissions.filter((permission) => permission !== 'admin_users.manage').length
      ? permissions.filter((permission) => permission !== 'admin_users.manage')
      : ['products.view']
}

async function parseBody(request: Request) {
  try {
    return await request.json() as Record<string, unknown>
  } catch {
    return null
  }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') ?? appOrigin
  if (request.method === 'OPTIONS') return new Response('ok', { headers: headers(origin) })
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405, origin)
  if (!supabaseUrl || !serviceRoleKey || !anonKey) return response({ error: 'Function secrets are not configured' }, 503, origin)

  const body = await parseBody(request)
  if (!body) return response({ error: 'Invalid JSON body' }, 400, origin)

  // New admin requests are created by the auth.users trigger after sign-up.
  // Keep the legacy action explicitly disabled so stale clients cannot submit a
  // browser-supplied user_id, even when the function gateway allows anonymous calls.
  if (body.action === 'submit_request') {
    return response({ error: 'Admin requests are created during Supabase Auth sign-up' }, 410, origin)
  }

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return response({ error: 'Authentication required' }, 401, origin)

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  })
  const { data: userData, error: userError } = await callerClient.auth.getUser()
  const callerEmail = normalizeEmail(userData.user?.email)
  if (userError || !callerEmail) return response({ error: 'Authentication required' }, 401, origin)

  // Pending and rejected applicants are not admin_users rows, so this personal
  // lookup must happen before the admin permission gate.
  if (body.action === 'get_request_status') {
    const { data: request, error: requestError } = await adminClient
      .from('admin_access_requests')
      .select('status, review_note, created_at')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (requestError) return response({ error: requestError.message }, 500, origin)
    return response({
      ok: true,
      request: request
        ? { status: request.status, review_note: request.review_note || null }
        : null,
    }, 200, origin)
  }

  const { data: callerRole, error: roleError } = await adminClient
    .from('admin_users')
    .select('role, is_active, permissions')
    .eq('email', callerEmail)
    .maybeSingle()
  const callerIsSuperAdmin = callerRole?.role === 'super_admin' && callerRole?.is_active === true
  const callerCanManageUsers = callerIsSuperAdmin || (
    callerRole?.role === 'admin' &&
    callerRole?.is_active === true &&
    Array.isArray(callerRole?.permissions) &&
    callerRole.permissions.includes('admin_users.manage')
  )
  if (roleError || !callerRole || !callerRole.is_active || !callerCanManageUsers) {
    return response({ error: 'User-management permission required' }, 403, origin)
  }

  if (body.action === 'list_requests') {
    if (!callerIsSuperAdmin) return response({ error: 'Only the configured Super Admin may review access requests' }, 403, origin)
    const { data, error } = await adminClient
      .from('admin_access_requests')
      .select('id, user_id, full_name, family_name, email, additional_info, status, created_at, updated_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return response({ error: error.message }, 500, origin)
    return response({ ok: true, requests: data ?? [] }, 200, origin)
  }

  if (body.action === 'invite_user') {
    const email = normalizeEmail(body.email)
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return response({ error: 'Valid email is required' }, 400, origin)
    if (!callerIsSuperAdmin) return response({ error: 'Only the configured Super Admin may send direct invitations' }, 403, origin)
    if (body.role === 'super_admin') return response({ error: 'Only the configured Super Admin may hold that role' }, 400, origin)
    const role = 'admin'
    const permissions = normalizePermissions(body.permissions, true)
    const { error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { admin_role: role },
    })
    if (authError && !authError.message.toLowerCase().includes('already registered')) return response({ error: authError.message }, 400, origin)

    const { error: rowError } = await adminClient
      .from('admin_users')
      .upsert({ email, role, is_active: true, permissions }, { onConflict: 'email' })
    if (rowError) return response({ error: rowError.message }, 500, origin)
    return response({ ok: true, email, role }, 200, origin)
  }

  if (body.action === 'review_request') {
    if (!callerIsSuperAdmin) return response({ error: 'Only the configured Super Admin may review access requests' }, 403, origin)
    const requestId = Number(body.request_id)
    const status = body.status === 'approved' || body.status === 'rejected' ? body.status : null
    if (!Number.isInteger(requestId) || !status) return response({ error: 'A valid request id and review status are required' }, 400, origin)

    const { data: accessRequest, error: requestError } = await adminClient
      .from('admin_access_requests')
      .select('id, user_id, email, status')
      .eq('id', requestId)
      .maybeSingle()
    if (requestError) return response({ error: requestError.message }, 500, origin)
    if (!accessRequest) return response({ error: 'Access request not found' }, 404, origin)
    if (accessRequest.status !== 'pending') return response({ error: 'This request has already been reviewed' }, 409, origin)

    const permissions = normalizePermissions(body.permissions, true)
    if (status === 'approved') {
      if (!accessRequest.user_id) return response({ error: 'This request is missing its Auth account link' }, 409, origin)
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(accessRequest.user_id)
      if (authError || !authUser.user) return response({ error: authError?.message || 'The Auth account no longer exists' }, 409, origin)
      if (normalizeEmail(authUser.user.email) !== accessRequest.email) return response({ error: 'The Auth account email does not match the request' }, 409, origin)

      const { error: rowError } = await adminClient
        .from('admin_users')
        .upsert({ email: accessRequest.email, role: 'admin', is_active: true, permissions }, { onConflict: 'email' })
      if (rowError) return response({ error: rowError.message }, 500, origin)
    }

    const { error: updateError } = await adminClient
      .from('admin_access_requests')
      .update({ status, reviewed_by: callerEmail, reviewed_at: new Date().toISOString(), review_note: String(body.note ?? '') })
      .eq('id', requestId)
    if (updateError) return response({ error: updateError.message }, 500, origin)
    return response({ ok: true, request_id: requestId, status, email: accessRequest.email }, 200, origin)
  }

  const email = normalizeEmail(body.email)
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return response({ error: 'Valid email is required' }, 400, origin)

  if (!callerIsSuperAdmin) return response({ error: 'Only the configured Super Admin may change existing admin accounts' }, 403, origin)

  if (body.action === 'update_user') {
    if (email === callerEmail && body.is_active === false) return response({ error: 'You cannot suspend your own Super Admin account' }, 400, origin)
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
    if (Array.isArray(body.permissions)) update.permissions = normalizePermissions(body.permissions, true)
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
