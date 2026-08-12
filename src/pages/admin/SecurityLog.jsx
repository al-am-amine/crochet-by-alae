/*
  Security reminder: “خيط هادئ” keeps the existing admin visual language;
  this page shows admin authentication and admin actions only, never public
  storefront browsing or customer activity telemetry.
*/
import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { getAdminAuditLogs } from '../../lib/adminAudit'

const ACTION_LABELS = {
  login_success: 'admin_audit_login_success',
  login_failure: 'admin_audit_login_failure',
  admin_page_access_denied: 'admin_audit_page_access_denied',
  product_created: 'admin_audit_product_created',
  product_updated: 'admin_audit_product_updated',
  product_deleted: 'admin_audit_product_deleted',
  order_status_updated: 'admin_audit_order_updated',
  custom_request_status_updated: 'admin_audit_request_updated',
  settings_updated: 'admin_audit_settings_updated',
  contact_channel_created: 'admin_audit_channel_created',
  contact_channel_updated: 'admin_audit_channel_updated',
  contact_channel_deleted: 'admin_audit_channel_deleted',
  admin_logout: 'admin_audit_logout',
}

function formatDetails(details) {
  if (!details || typeof details !== 'object') return '—'
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(' · ') || '—'
}

export default function SecurityLog() {
  const { t, lang } = useLanguage()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminAuditLogs().then(({ data, error: queryError }) => {
      if (!active) return
      setLogs(data)
      if (queryError) setError(t('admin_security_log_unavailable'))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [t])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 border-b border-outline-variant/50 pb-6">
        <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('admin_security_log')}</h1>
        <p className="font-body-md text-sm text-on-surface-variant">{t('admin_security_log_description')}</p>
      </header>

      {error && <p className="rounded-lg bg-secondary-container px-4 py-3 text-sm text-on-secondary-container" role="alert">{error}</p>}

      {loading ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('loading')}</p>
      ) : logs.length === 0 ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('admin_security_log_empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_20px_20px_rgba(212,132,154,0.03)]">
          <table className="w-full min-w-[760px] text-start font-body-md text-body-md">
            <thead>
              <tr className="border-b-2 border-surface-container-high">
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_time')}</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_email')}</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_action')}</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_details')}</th>
                <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">{t('admin_security_ip_hint')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="whitespace-nowrap p-3 text-xs text-on-surface-variant">
                    {new Date(log.created_at).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')}
                  </td>
                  <td className="p-3">{log.admin_email || '—'}</td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${log.action === 'login_failure' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'}`}>
                      {t(ACTION_LABELS[log.action] || 'admin_audit_other')}
                    </span>
                  </td>
                  <td className="max-w-[320px] p-3 text-xs text-on-surface-variant">{formatDetails(log.details)}</td>
                  <td className="p-3 text-xs text-on-surface-variant">{log.ip_hint || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
