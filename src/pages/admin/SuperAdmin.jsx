/*
  SUPER ADMIN PORTAL — premium monochrome identity.
  Fully separated from the regular admin dashboard. Palette: deep black
  surfaces, white text, graphite borders, silver accents. No brand pink.
  Only super admins (and admins explicitly delegated admin_users.manage)
  can enter; everyone else is silently redirected with zero hints.
*/
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { useAuth } from '../../lib/AuthContext'
import { logAdminAction } from '../../lib/adminAudit'
import { ADMIN_PERMISSION_KEYS, inviteAdminUser, listManagedAdmins, removeAdminUser, updateAdminUser } from '../../lib/adminUserManagement'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

const NAV_LINKS = [
  { key: 'admin_users', icon: 'admin_panel_settings' },
]

export default function SuperAdmin() {
  const { isAdmin, isSuperAdmin, hasPermission, session } = useAuth()
  const { t } = useLanguage()
  const [admins, setAdmins] = useState([])
  const [email, setEmail] = useState('')
  const [permissions, setPermissions] = useState(['products.view'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    if (!isAdmin || (!isSuperAdmin && !hasPermission('admin_users.manage'))) {
      setLoading(false)
      return () => {
        active = false
      }
    }
    listManagedAdmins().then(({ data, error: queryError }) => {
      if (!active) return
      setAdmins(data || [])
      if (queryError) setError(t('admin_users_unavailable'))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [hasPermission, isAdmin, isSuperAdmin, t])

  if (!isAdmin) return <Navigate to="/admin/login" replace />
  // Regular admins without the user-management permission can never enter,
  // never see the admin list and never learn that other admins exist.
  if (!isSuperAdmin && !hasPermission('admin_users.manage')) return <Navigate to="/admin" replace />

  async function handleInvite(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError(t('admin_users_invalid_email'))
      return
    }

    setSaving(true)
    const { data, error: invokeError } = await inviteAdminUser({ email: normalizedEmail, role: 'admin', permissions })
    setSaving(false)
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_users_save_error'))
      return
    }

    await logAdminAction('admin_user_invited', { email: normalizedEmail, role: 'admin', permissions })
    setEmail('')
    setPermissions(['products.view'])
    setNotice(t('admin_users_invited'))
    const { data: refreshed } = await listManagedAdmins()
    setAdmins(refreshed || [])
  }

  async function handleStatusChange(admin) {
    setError('')
    setNotice('')
    const nextActive = !admin.is_active
    const { data, error: invokeError } = await updateAdminUser({ email: admin.email, isActive: nextActive })
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_users_save_error'))
      return
    }
    await logAdminAction('admin_user_status_updated', { email: admin.email, is_active: nextActive })
    setAdmins((current) => current.map((item) => (item.email === admin.email ? { ...item, is_active: nextActive } : item)))
    setNotice(t('admin_users_saved'))
  }

  async function handlePermissionsChange(admin, permission) {
    const nextPermissions = (admin.permissions || []).includes(permission)
      ? (admin.permissions || []).filter((item) => item !== permission)
      : [...(admin.permissions || []), permission]
    const { data, error: invokeError } = await updateAdminUser({ email: admin.email, permissions: nextPermissions })
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_users_save_error'))
      return
    }
    setAdmins((current) => current.map((item) => (item.email === admin.email ? { ...item, permissions: nextPermissions } : item)))
    setNotice(t('admin_users_saved'))
  }

  async function handleRemove(admin) {
    setError('')
    setNotice('')
    const { data, error: invokeError } = await removeAdminUser(admin.email)
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_users_save_error'))
      return
    }
    await logAdminAction('admin_user_removed', { email: admin.email })
    setAdmins((current) => current.filter((item) => item.email !== admin.email))
    setNotice(t('admin_users_removed'))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f2f2f2]" dir="rtl">
      <div className="hidden md:flex fixed end-0 top-0 h-screen w-60 flex-col border-s border-[#242424] bg-[#0f0f0f] z-40">
        <div className="flex flex-col items-center border-b border-[#242424] py-8">
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center mb-3">
            <Icon name="shield" size={26} className="text-[#d9d9d9]" />
          </div>
          <h2 className="text-[15px] font-bold tracking-wide text-[#f2f2f2]">{t('admin_users_title')}</h2>
          <p className="mt-1 text-[11px] text-[#8a8a8a]">{t('admin_users_role_super')}</p>
        </div>
        <div className="flex flex-col gap-1 flex-grow overflow-y-auto p-3">
          {NAV_LINKS.map(({ key, icon }) => <span key={key} className="flex items-center gap-3 p-3 rounded-lg text-[13px] font-bold bg-[#171717] text-[#ffffff] border border-[#2a2a2a]"><Icon name={icon} size={18} /><span>{t(key)}</span></span>)}
          <Link to="/admin" className="mt-4 flex items-center gap-3 p-3 rounded-lg text-[12px] text-[#8a8a8a] transition hover:bg-[#171717] hover:text-[#f2f2f2]"><Icon name="arrow_back" size={16} /><span>{t('admin_back_dashboard')}</span></Link>
        </div>
        <div className="border-t border-[#242424] p-3">
          <button onClick={async () => { await logAdminAction('admin_logout'); await supabase.auth.signOut() }} className="flex items-center gap-3 p-3 w-full text-[12px] text-[#8a8a8a] rounded-lg transition hover:bg-[#171717] hover:text-[#f2f2f2]"><Icon name="logout" size={16} /><span>{t('admin_logout')}</span></button>
        </div>
      </div>

      <main className="md:pe-60 min-h-screen flex flex-col">
        <header className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#0f0f0f]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="md:hidden flex items-center gap-2 text-[12px] text-[#8a8a8a] transition hover:text-[#f2f2f2]"><Icon name="arrow_back" size={16} /><span>{t('admin_back_dashboard')}</span></Link>
            <h1 className="text-[14px] font-bold tracking-[0.22em] uppercase text-[#f2f2f2]">{t('admin_users_title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[11px] text-[#8a8a8a] max-w-[260px] truncate">{session?.user?.email}</span>
            <span className="rounded-full border border-[#333333] bg-[#171717] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d9d9d9]">{t('admin_users_role_super')}</span>
          </div>
        </header>

        <div className="flex-grow p-6 md:p-10 max-w-6xl w-full mx-auto">
          <SuperPanel
            t={t}
            admins={admins}
            email={email}
            setEmail={setEmail}
            permissions={permissions}
            setPermissions={setPermissions}
            loading={loading}
            saving={saving}
            error={error}
            notice={notice}
            onInvite={handleInvite}
            onStatusChange={handleStatusChange}
            onPermissionsChange={handlePermissionsChange}
            onRemove={handleRemove}
          />
        </div>
      </main>
    </div>
  )
}

const inputClass = "mt-2 w-full rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-3 text-sm text-[#f2f2f2] outline-none transition focus:border-[#6e6e6e] focus:ring-2 focus:ring-[#6e6e6e]/20"
const labelClass = "block text-sm font-semibold text-[#e5e5e5]"

function SuperPanel({ t, admins, email, setEmail, permissions, setPermissions, loading, saving, error, notice, onInvite, onStatusChange, onPermissionsChange, onRemove }) {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 border-b border-[#1e1e1e] pb-6">
        <div className="flex items-center gap-3">
          <Icon name="admin_panel_settings" size={26} className="text-[#d9d9d9]" />
          <h2 className="text-[20px] font-bold text-[#f2f2f2]">{t('admin_users_title')}</h2>
        </div>
        <p className="text-sm text-[#8a8a8a]">{t('admin_users_description')}</p>
      </header>

      <div className="rounded-xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm text-[#b8b8b8]">
        {t('admin_users_security_note')}
      </div>

      {error && <p className="rounded-lg bg-[#1a1414] border border-[#3a2222] px-4 py-3 text-sm text-[#e8a9a0]" role="alert">{error}</p>}
      {notice && <p className="rounded-lg bg-[#131814] border border-[#22332a] px-4 py-3 text-sm text-[#9fd8b2]" role="status">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form onSubmit={onInvite} className="space-y-4 rounded-xl bg-[#101010] border border-[#242424] p-5">
          <div>
            <h3 className="text-[16px] font-bold text-[#f2f2f2]">{t('admin_users_add_title')}</h3>
            <p className="mt-1 text-sm text-[#8a8a8a]">{t('admin_users_add_description')}</p>
          </div>
          <label className={labelClass}>
            {t('admin_email')}
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" className={inputClass} required />
          </label>
          <div>
            <p className="text-sm font-semibold text-[#e5e5e5]">{t('admin_users_role')}</p>
            <p className="mt-2 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-3 text-sm text-[#8a8a8a]">{t('admin_users_role_admin')} — {t('admin_users_only_one_super')}</p>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-[#e5e5e5]">{t('admin_users_permissions')}</legend>
            {ADMIN_PERMISSION_KEYS.map((permission) => <label key={permission} className="flex items-center gap-2 text-sm text-[#b8b8b8]"><input type="checkbox" checked={permissions.includes(permission)} onChange={() => setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission])} className="accent-[#d9d9d9]" />{t(PERMISSION_LABELS[permission])}</label>)}
          </fieldset>
          <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f2f2f2] px-4 py-3 text-sm font-bold text-[#0a0a0a] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.08)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60">
            <Icon name="person_add" size={20} />
            {saving ? t('loading') : t('admin_users_invite_button')}
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl bg-[#101010] border border-[#242424]">
          <div className="border-b border-[#242424] px-5 py-4">
            <h3 className="text-[16px] font-bold text-[#f2f2f2]">{t('admin_users_list_title')}</h3>
          </div>
          {loading ? (
            <p className="p-5 text-sm text-[#8a8a8a]">{t('loading')}</p>
          ) : admins.length === 0 ? (
            <p className="p-5 text-sm text-[#8a8a8a]">{t('admin_users_empty')}</p>
          ) : (
            <table className="w-full min-w-[560px] text-start text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] text-xs text-[#8a8a8a]">
                  <th className="p-4 font-semibold">{t('admin_security_email')}</th>
                  <th className="p-4 font-semibold">{t('admin_users_role')}</th>
                  <th className="p-4 font-semibold">{t('admin_users_status')}</th>
                  <th className="p-4 font-semibold">{t('admin_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {admins.map((admin) => (
                  <tr key={admin.email} className="transition-colors hover:bg-[#141414]">
                    <td className="p-4 font-medium text-[#e5e5e5]">{admin.email}</td>
                    <td className="p-4 text-[#b8b8b8]">{admin.role === 'super_admin' ? t('admin_users_role_super') : t('admin_users_role_admin')}<div className="mt-2 flex max-w-[360px] flex-wrap gap-2">{(admin.permissions || []).map((permission) => <span key={permission} className="rounded-full bg-[#1a1a1a] border border-[#2c2c2c] px-2 py-1 text-[11px] text-[#9d9d9d]">{t(PERMISSION_LABELS[permission] || permission)}</span>)}</div></td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${admin.is_active ? 'bg-[#131814] border border-[#22332a] text-[#9fd8b2]' : 'bg-[#1a1414] border border-[#3a2222] text-[#e8a9a0]'}`}>
                        {admin.is_active ? t('admin_users_active') : t('admin_users_inactive')}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      {admin.role !== 'super_admin' && <details><summary className="cursor-pointer text-sm font-bold text-[#d9d9d9]">{t('admin_users_permissions_edit')}</summary><div className="mt-2 space-y-2">{ADMIN_PERMISSION_KEYS.map((permission) => <label key={permission} className="flex items-center gap-2 text-xs text-[#b8b8b8]"><input type="checkbox" checked={(admin.permissions || []).includes(permission)} onChange={() => onPermissionsChange(admin, permission)} className="accent-[#d9d9d9]" />{t(PERMISSION_LABELS[permission])}</label>)}</div></details>}
                      {admin.role === 'super_admin' ? <span className="text-xs text-[#8a8a8a]">{t('admin_users_owner_locked')}</span> : <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => onStatusChange(admin)} className="text-sm font-bold text-[#d9d9d9] underline-offset-4 transition hover:underline">{admin.is_active ? t('admin_users_disable') : t('admin_users_enable')}</button><button type="button" onClick={() => onRemove(admin)} className="text-sm font-bold text-[#e8a9a0] underline-offset-4 transition hover:underline">{t('admin_users_remove')}</button></div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  )
}
