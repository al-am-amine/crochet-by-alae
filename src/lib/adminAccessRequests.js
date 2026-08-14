/*
  Design reminder: keep the warm admin language and collect only the identity
  details needed for review. The password goes directly to Supabase Auth during
  sign-up and is never included in the admin request payload or audit records.
*/
import { supabase } from './supabaseClient'

export async function registerAdminAccessRequest({ fullName, familyName, email, password, additionalInfo }) {
  const normalizedEmail = email.trim().toLowerCase()
  const emailRedirectTo = typeof window === 'undefined' ? undefined : `${window.location.origin}/admin/login`
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name: fullName.trim(),
        family_name: familyName.trim(),
        admin_onboarding: true,
        additional_info: additionalInfo.trim(),
      },
    },
  })

  if (signUpError) return { data: null, error: signUpError }
  if (!signUpData.user?.id) return { data: null, error: new Error('The account could not be created') }
  if (Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0) {
    return { data: null, error: new Error('An account with this email already exists') }
  }
  return {
    data: {
      ok: true,
      status: 'pending',
      emailConfirmationRequired: !signUpData.session,
    },
    error: null,
  }
}

export async function listAdminAccessRequests() {
  return supabase.functions.invoke('admin-user-management', {
    body: { action: 'list_requests' },
  })
}

export async function getAdminAccessRequestStatus() {
  const { data, error } = await supabase.rpc('get_my_request_status')
  return {
    data: { ok: true, request: data || null },
    error,
  }
}

export async function reviewAdminAccessRequest({ requestId, status, permissions, note = '' }) {
  return supabase.functions.invoke('admin-user-management', {
    body: {
      action: 'review_request',
      request_id: requestId,
      status,
      permissions,
      note,
    },
  })
}
