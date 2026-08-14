/*
  Design reminder: retain the warm audit table and clear hierarchy; regular
  admins see only permitted events, while only Super Admin receives the
  destructive control, protected by a visible confirmation dialog.
*/
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import { useAuth } from '../../lib/AuthContext'
import { clearSecurityLog, getAdminAuditLogs } from '../../lib/adminAudit'

const ACTION_LABELS = { login_success: 'admin_audit_login_success', login_failure: 'admin_audit_login_failure', admin_page_access_denied: 'admin_audit_page_access_denied', product_created: 'admin_audit_product_created', product_updated: 'admin_audit_product_updated', product_deleted: 'admin_audit_product_deleted', order_status_updated: 'admin_audit_order_updated', custom_request_status_updated: 'admin_audit_request_updated', settings_updated: 'admin_audit_settings_updated', contact_channel_created: 'admin_audit_channel_created', contact_channel_updated: 'admin_audit_channel_updated', contact_channel_deleted: 'admin_audit_channel_deleted', admin_logout: 'admin_audit_logout', admin_access_request_approved: 'admin_audit_access_request_approved', admin_access_request_rejected: 'admin_audit_access_request_rejected' }

function formatDetails(details) {
  if (!details || typeof details !== 'object') return '—'
  return Object.entries(details).map(([key, value]) => `${key}: ${String(value).slice(0, 180)}`).join(' · ') || '—'
}

export default function SecurityLog() {
  const { t, lang } = useLanguage()
  const { hasPermission, isSuperAdmin } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadLogs() {
    setLoading(true)
    const { data, error: queryError } = await getAdminAuditLogs()
    setLogs(data)
    if (queryError) setError(t('admin_security_log_unavailable'))
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    if (!hasPermission('security_log.view')) { setLoading(false); return () => { active = false } }
    getAdminAuditLogs().then(({ data, error: queryError }) => {
      if (!active) return
      setLogs(data)
      if (queryError) setError(t('admin_security_log_unavailable'))
      setLoading(false)
    })
    return () => { active = false }
  }, [hasPermission, t])

  async function handleClear() {
    setClearing(true)
    setError('')
    setNotice('')
    const { data, error: clearError } = await clearSecurityLog()
    setClearing(false)
    setConfirmOpen(false)
    if (clearError) {
      setError(clearError.message || t('admin_security_log_clear_error'))
      return
    }
    setLogs([])
    setNotice(t('admin_security_log_clear_success'))
    return data
  }

  if (!hasPermission('security_log.view')) return <Navigate to="/admin" replace />
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-outline-variant/50 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('admin_security_log')}</h1>
          <p className="font-body-md text-sm text-on-surface-variant">{t('admin_security_log_description')}</p>
        </div>
        {isSuperAdmin && <button type="button" onClick={() => setConfirmOpen(true)} className="motion-press inline-flex items-center justify-center gap-2 rounded-lg border border-error/30 px-4 py-2 text-sm font-bold text-error transition hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30">
          <span className="material-symbols-outlined text-base" aria-hidden="true">delete_sweep</span>
          {t('admin_security_log_clear_button')}
        </button>}
      </header>
      {error && <p className="rounded-lg bg-secondary-container px-4 py-3 text-sm text-on-secondary-container" role="alert">{error}</p>}
      {notice && <p className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary" role="status">{notice}</p>}
      {loading ? <p className="font-body-md text-sm text-on-surface-variant">{t('loading')}</p> : logs.length === 0 ? <p className="font-body-md text-sm text-on-surface-variant">{t('admin_security_log_empty')}</p> : <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_20px_20px_rgba(212,132,154,0.03)]"><table className="w-full min-w-[760px] text-start font-body-md text-body-md"><thead><tr className="border-b-2 border-surface-container-high"><th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_time')}</th><th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_email')}</th><th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_action')}</th><th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_details')}</th><th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_ip_hint')}</th></tr></thead><tbody className="divide-y divide-outline-variant/20">{logs.map((log) => <tr key={log.id} className="transition-colors hover:bg-surface-container/40"><td className="whitespace-nowrap p-3 text-xs text-on-surface-variant">{new Date(log.created_at).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')}</td><td className="p-3">{log.admin_email || '—'}</td><td className="p-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${log.action === 'login_failure' ? 'bg-secondary-container text-secondary' : 'bg-primary-container text-on-primary-container'}`}>{t(ACTION_LABELS[log.action] || 'admin_audit_other')}</span></td><td className="max-w-[320px] p-3 text-xs text-on-surface-variant">{formatDetails(log.details)}</td><td className="p-3 text-xs text-on-surface-variant">{log.ip_hint || '—'}</td></tr>)}</tbody></table></div>}

      {confirmOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !clearing) setConfirmOpen(false) }}>
        <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface p-6 text-on-surface shadow-2xl dark:bg-[#242019] dark:text-white" role="dialog" aria-modal="true" aria-labelledby="clear-security-log-title">
          <h2 id="clear-security-log-title" className="text-lg font-bold">{t('admin_security_log_clear_title')}</h2>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">{t('admin_security_log_clear_description')}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" disabled={clearing} onClick={() => setConfirmOpen(false)} className="motion-press rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-60">{t('admin_security_log_clear_cancel')}</button>
            <button type="button" disabled={clearing} onClick={handleClear} className="motion-press rounded-lg bg-error px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60">{clearing ? t('loading') : t('admin_security_log_clear_confirm')}</button>
          </div>
        </div>
      </div>}
    </section>
  )
}
