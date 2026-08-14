/*
  Security reminder: “خيط هادئ” applies to the admin UI too — keep the
  existing visual identity, while recording only admin authentication and
  admin actions. Never collect public storefront visitor activity here.
*/
import { supabase } from './supabaseClient'

const DEFAULT_ADMIN_EMAILS = [
  'm.amine.amttout@gmail.com',
]
const REMOVED_ADMIN_EMAILS = new Set(['admin.crochetbyalae@gmail.com'])

const configuredAdminEmails = String(import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email && !REMOVED_ADMIN_EMAILS.has(email))

export const ADMIN_EMAILS = [...new Set([...DEFAULT_ADMIN_EMAILS, ...configuredAdminEmails])]
export const ADMIN_EMAIL = ADMIN_EMAILS[0]
const configuredSuperAdminEmails = String(import.meta.env.VITE_SUPER_ADMIN_EMAILS || ADMIN_EMAIL)
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email && !REMOVED_ADMIN_EMAILS.has(email))
export const SUPER_ADMIN_EMAILS = [...new Set(configuredSuperAdminEmails)]

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase())
}

export function isSuperAdminEmail(email) {
  return SUPER_ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase())
}

export async function getCurrentAdminRole() {
  try {
    const { data, error } = await supabase.rpc('get_current_admin_role')
    return { role: typeof data === 'string' ? data : data?.role || null, error }
  } catch (error) {
    return { role: null, error }
  }
}

export async function getCurrentAdminAccess() {
  try {
    const { data, error } = await supabase.rpc('get_current_admin_access')
    return { data: data || null, error }
  } catch (error) {
    return { data: null, error }
  }
}

export function getAdminAttemptContext() {
  if (typeof navigator === 'undefined') return {}

  return {
    browser_hint: String(navigator.userAgent || '').slice(0, 180),
    platform_hint: String(navigator.platform || '').slice(0, 80),
    language: String(navigator.language || '').slice(0, 32),
    timezone: String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 64),
  }
}

export async function checkAdminLoginGate(email) {
  try {
    const { data, error } = await supabase.rpc('admin_login_gate', {
      attempted_email: email.trim().toLowerCase(),
    })
    if (error) return { allowed: true }
    return {
      allowed: data?.allowed !== false,
      retryAfterSeconds: Number(data?.retry_after_seconds || 0),
    }
  } catch (error) {
    console.warn('Admin login gate unavailable', error)
    return { allowed: true }
  }
}

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

export async function logAdminPageAccessAttempt({ email = '[unknown]', path = '/admin', metadata = {} } = {}) {
  try {
    await supabase.rpc('log_admin_page_attempt', {
      attempted_email: email.trim().toLowerCase() || '[unknown]',
      path_name: path,
      metadata,
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
  const { data: userData } = await supabase.auth.getUser()
  const email = String(userData?.user?.email || '').trim().toLowerCase()
  const { data: access } = await getCurrentAdminAccess()
  let query = supabase
    .from('admin_audit_log')
    .select('id, admin_email, action, details, ip_hint, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (access?.role !== 'super_admin') query = query.eq('admin_email', email)
  const { data, error } = await query

  return { data: data ?? [], error }
}

export async function clearSecurityLog() {
  try {
    const { data, error } = await supabase.rpc('clear_admin_audit_log')
    return { data: Number(data || 0), error }
  } catch (error) {
    return { data: 0, error }
  }
}
