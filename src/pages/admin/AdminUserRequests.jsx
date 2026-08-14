/*
  Design reminder: fold ownership controls into the original warm admin shell.
  Ordinary admins see only the request inbox they are allowed to review; the
  current admin list is rendered only for the configured owner account.
*/
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { useAuth } from '../../lib/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { ADMIN_PERMISSION_KEYS, inviteAdminUser, listManagedAdmins, updateAdminUser, removeAdminUser } from '../../lib/adminUserManagement'
import { listAdminAccessRequests, reviewAdminAccessRequest } from '../../lib/adminAccessRequests'
import { logAdminAction } from '../../lib/adminAudit'

const PERMISSION_LABELS = {
  'products.view': 'admin_permission_products_view',
  'products.manage': 'admin_permission_products_manage',
  'orders.view': 'admin_permission_orders_view',
  'orders.manage': 'admin_permission_orders_manage',
  'custom_requests.view': 'admin_permission_requests_view',
  'custom_requests.manage': 'admin_permission_requests_manage',
  'customers.view': 'admin_permission_customers_view',
  'customers.manage': 'admin_permission_customers_manage',
  'settings.manage': 'admin_permission_settings_manage',
  'security_log.view': 'admin_permission_security_view',
  'admin_users.manage': 'admin_permission_users_manage',
}

export default function AdminUserRequests() {
  const { loading: authLoading, isAdmin, isSuperAdmin } = useAuth()
  const { t } = useLanguage()
  const canManageUsers = isSuperAdmin
  const visiblePermissions = useMemo(() => isSuperAdmin ? ADMIN_PERMISSION_KEYS : ADMIN_PERMISSION_KEYS.filter((permission) => permission !== 'admin_users.manage'), [isSuperAdmin])
  const [requests, setRequests] = useState([])
  const [admins, setAdmins] = useState([])
  const [drafts, setDrafts] = useState({})
  const [directEmail, setDirectEmail] = useState('')
  const [directPermissions, setDirectPermissions] = useState(['products.view'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function refresh() {
    setLoading(true)
    const [requestResult, adminResult] = await Promise.all([
      listAdminAccessRequests(),
      isSuperAdmin ? listManagedAdmins() : Promise.resolve({ data: [], error: null }),
    ])
    const requestData = requestResult.data?.requests || []
    setRequests(requestData)
    setAdmins(adminResult.data || [])
    setDrafts(Object.fromEntries(requestData.map((request) => [request.id, ['products.view']])))
    if (requestResult.error || requestResult.data?.error) setError(requestResult.error?.message || requestResult.data?.error || t('admin_requests_unavailable'))
    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading && canManageUsers) void refresh()
  }, [authLoading, canManageUsers, isSuperAdmin])

  if (authLoading) return <p className="flex min-h-[40vh] items-center justify-center text-sm">{t('loading')}</p>
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  if (!canManageUsers) return <Navigate to="/admin" replace />

  async function handleReview(request, status) {
    setSaving(`${request.id}:${status}`)
    setError('')
    setNotice('')
    const { data, error: invokeError } = await reviewAdminAccessRequest({
      requestId: request.id,
      status,
      permissions: drafts[request.id] || ['products.view'],
    })
    setSaving('')
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_requests_save_error'))
      return
    }
    await logAdminAction(status === 'approved' ? 'admin_access_request_approved' : 'admin_access_request_rejected', { request_id: request.id, email: request.email })
    setNotice(status === 'approved' ? t('admin_request_approved') : t('admin_request_rejected'))
    await refresh()
  }

  async function handleDirectInvite(event) {
    event.preventDefault()
    setSaving('direct')
    setError('')
    setNotice('')
    const { data, error: invokeError } = await inviteAdminUser({ email: directEmail, role: 'admin', permissions: directPermissions })
    setSaving('')
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_users_save_error'))
      return
    }
    await logAdminAction('admin_user_invited', { email: directEmail.trim().toLowerCase(), permissions: directPermissions })
    setDirectEmail('')
    setDirectPermissions(['products.view'])
    setNotice(t('admin_users_invited'))
    await refresh()
  }

  async function handleStatusChange(admin) {
    setSaving(`status:${admin.email}`)
    const { data, error: invokeError } = await updateAdminUser({ email: admin.email, isActive: !admin.is_active })
    setSaving('')
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_users_save_error'))
      return
    }
    setNotice(t('admin_users_saved'))
    await refresh()
  }

  async function handleRemove(admin) {
    setSaving(`remove:${admin.email}`)
    const { data, error: invokeError } = await removeAdminUser(admin.email)
    setSaving('')
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_users_save_error'))
      return
    }
    setNotice(t('admin_users_removed'))
    await refresh()
  }

  function togglePermission(requestId, permission) {
    setDrafts((current) => ({
      ...current,
      [requestId]: (current[requestId] || []).includes(permission)
        ? (current[requestId] || []).filter((item) => item !== permission)
        : [...(current[requestId] || []), permission],
    }))
  }

  return (
    <section className="space-y-6" dir="rtl">
      <header className="flex flex-col gap-2 border-b border-outline-variant/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3 text-primary"><Icon name="person_add" size={26} /><h1 className="font-headline-lg text-headline-lg text-primary">{t('admin_access_requests')}</h1></div>
          <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">{t('admin_requests_description')}</p>
        </div>
        <span className="rounded-full border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">{t('admin_requests_private_note')}</span>
      </header>

      {error && <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="alert">{error}</p>}
      {notice && <p className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary" role="status">{notice}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <article className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
            <h2 className="text-lg font-bold text-on-surface">{t('admin_requests_pending_title')}</h2>
            <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">{requests.length}</span>
          </div>
          {loading ? <p className="text-sm text-on-surface-variant">{t('loading')}</p> : requests.length === 0 ? <p className="rounded-lg border border-dashed border-outline-variant/50 px-4 py-8 text-center text-sm text-on-surface-variant">{t('admin_requests_empty')}</p> : <div className="space-y-4">{requests.map((request) => <div key={request.id} className="rounded-xl border border-outline-variant/30 bg-surface p-4 shadow-sm transition hover:-translate-y-0.5">
            <div className="flex flex-col gap-2 border-b border-outline-variant/20 pb-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-bold text-on-surface">{request.full_name} {request.family_name}</h3><p className="text-sm text-on-surface-variant">{request.email}</p>{request.additional_info && <div className="mt-3 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-xs leading-6 text-on-surface-variant"><span className="font-bold text-on-surface">{t('admin_request_additional_info')}:</span> {request.additional_info}</div>}</div><time className="text-xs text-on-surface-variant" dateTime={request.created_at}>{new Date(request.created_at).toLocaleString()}</time></div>
            <fieldset className="mt-4 space-y-2"><legend className="mb-2 text-xs font-bold text-on-surface-variant">{t('admin_request_permissions')}</legend>{visiblePermissions.map((permission) => <label key={permission} className="flex items-center gap-2 text-xs text-on-surface-variant"><input type="checkbox" checked={(drafts[request.id] || []).includes(permission)} onChange={() => togglePermission(request.id, permission)} className="accent-primary" />{t(PERMISSION_LABELS[permission])}</label>)}</fieldset>
            <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={Boolean(saving)} onClick={() => handleReview(request, 'approved')} className="motion-press inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary transition hover:opacity-90 disabled:opacity-60"><Icon name="check" size={16} />{saving === `${request.id}:approved` ? t('loading') : t('admin_request_approve')}</button><button type="button" disabled={Boolean(saving)} onClick={() => handleReview(request, 'rejected')} className="motion-press inline-flex items-center gap-2 rounded-lg border border-error/30 px-4 py-2 text-xs font-bold text-error transition hover:bg-error/10 disabled:opacity-60"><Icon name="close" size={16} />{saving === `${request.id}:rejected` ? t('loading') : t('admin_request_reject')}</button></div>
          </div>)}</div>}
        </article>

        <div className="space-y-6">
          {isSuperAdmin && <>
            <form onSubmit={handleDirectInvite} className="space-y-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
              <div><h2 className="text-lg font-bold text-on-surface">{t('admin_users_add_title')}</h2><p className="mt-1 text-sm leading-6 text-on-surface-variant">{t('admin_users_add_description')}</p></div>
              <input type="email" required value={directEmail} onChange={(event) => setDirectEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-3 text-sm text-on-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <div className="space-y-2">{ADMIN_PERMISSION_KEYS.map((permission) => <label key={permission} className="flex items-center gap-2 text-xs text-on-surface-variant"><input type="checkbox" checked={directPermissions.includes(permission)} onChange={() => setDirectPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission])} className="accent-primary" />{t(PERMISSION_LABELS[permission])}</label>)}</div>
              <button type="submit" disabled={Boolean(saving)} className="motion-press inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-on-primary disabled:opacity-60"><Icon name="person_add" size={18} />{saving === 'direct' ? t('loading') : t('admin_users_invite_button')}</button>
            </form>
            <article className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
              <h2 className="mb-4 text-lg font-bold text-on-surface">{t('admin_users_list_title')}</h2>
              {loading ? <p className="text-sm text-on-surface-variant">{t('loading')}</p> : admins.length === 0 ? <p className="text-sm text-on-surface-variant">{t('admin_users_empty')}</p> : <table className="w-full min-w-[520px] text-start text-sm"><thead><tr className="border-b border-outline-variant/30 text-xs text-on-surface-variant"><th className="p-3">{t('admin_security_email')}</th><th className="p-3">{t('admin_users_status')}</th><th className="p-3">{t('admin_action')}</th></tr></thead><tbody className="divide-y divide-outline-variant/20">{admins.map((admin) => <tr key={admin.email}><td className="p-3 font-medium text-on-surface">{admin.email}<div className="mt-1 text-xs text-on-surface-variant">{admin.role === 'super_admin' ? t('admin_users_role_super') : t('admin_users_role_admin')}</div></td><td className="p-3 text-xs text-on-surface-variant">{admin.is_active ? t('admin_users_active') : t('admin_users_inactive')}</td><td className="p-3">{admin.role === 'super_admin' ? <span className="text-xs text-on-surface-variant">{t('admin_users_owner_locked')}</span> : <div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(saving)} onClick={() => handleStatusChange(admin)} className="text-xs font-bold text-primary underline-offset-4 hover:underline">{admin.is_active ? t('admin_users_disable') : t('admin_users_enable')}</button><button type="button" disabled={Boolean(saving)} onClick={() => handleRemove(admin)} className="text-xs font-bold text-error underline-offset-4 hover:underline">{t('admin_users_remove')}</button></div>}</td></tr>)}</tbody></table>}
            </article>
          </>}
          {!isSuperAdmin && <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 text-sm leading-7 text-on-surface-variant">{t('admin_requests_manager_note')}</div>}
        </div>
      </div>
    </section>
  )
}
