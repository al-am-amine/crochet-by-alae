/*
  Security reminder: “خيط هادئ” applies to the admin UI too — keep the
  existing visual identity, while recording only admin authentication and
  admin actions. Never collect public storefront visitor activity here.
*/
import { supabase } from './supabaseClient'

export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'admin.crochetbyalae@gmail.com').trim().toLowerCase()

export async function logAdminLoginAttempt({ email, success, details = {} }) {
  try {
    await supabase.rpc('log_admin_login_attempt', {
      attempted_email: email.trim().toLowerCase(),
      was_success: success,
      metadata: details,
    })
  } catch (error) {
    console.warn('Admin login audit unavailable', error)
  }
}

export async function logAdminPageAccessAttempt({ email = '[unknown]', path = '/admin' } = {}) {
  try {
    await supabase.rpc('log_admin_page_attempt', {
      attempted_email: email.trim().toLowerCase() || '[unknown]',
      path_name: path,
    })
  } catch (error) {
    console.warn('Admin page audit unavailable', error)
  }
}

export async function logAdminAction(action, details = {}) {
  try {
    await supabase.rpc('log_admin_action', {
      action_name: action,
      metadata: details,
    })
  } catch (error) {
    console.warn('Admin activity audit unavailable', error)
  }
}

export async function getAdminAuditLogs() {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('id, admin_email, action, details, ip_hint, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  return { data: data ?? [], error }
}
