/*
  Design reminder: keep the warm, compact admin language and never collect or
  store passwords in the browser. The protected Edge Function owns mutations.
*/
import { supabase } from './supabaseClient'

export const ADMIN_PERMISSION_KEYS = [
  'products.view',
  'products.manage',
  'orders.view',
  'orders.manage',
  'custom_requests.view',
  'custom_requests.manage',
  'customers.view',
  'customers.manage',
  'settings.manage',
  'security_log.view',
  'admin_users.manage',
]

export async function listManagedAdmins() {
  return supabase
    .from('admin_users')
    .select('email, role, is_active, permissions, created_at, updated_at')
    .order('created_at', { ascending: true })
}

export async function inviteAdminUser({ email, role = 'admin', permissions = ['products.view'] }) {
  return supabase.functions.invoke('admin-user-management', {
    body: {
      action: 'invite_user',
      email: email.trim().toLowerCase(),
      role,
      permissions,
    },
  })
}

export async function updateAdminUser({ email, role, isActive, permissions }) {
  return supabase.functions.invoke('admin-user-management', {
    body: {
      action: 'update_user',
      email: email.trim().toLowerCase(),
      ...(role ? { role } : {}),
      ...(typeof isActive === 'boolean' ? { is_active: isActive } : {}),
      ...(Array.isArray(permissions) ? { permissions } : {}),
    },
  })
}

export async function removeAdminUser(email) {
  return supabase.functions.invoke('admin-user-management', {
    body: { action: 'remove_user', email: email.trim().toLowerCase() },
  })
}
