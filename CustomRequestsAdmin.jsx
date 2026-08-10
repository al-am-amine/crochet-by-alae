import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'

const STATUS_KEYS = {
  new: 'request_status_new', reviewing: 'request_status_reviewing',
  contacted: 'request_status_contacted', accepted: 'request_status_accepted',
  rejected: 'request_status_rejected',
}

export default function CustomRequestsAdmin() {
  const { t, lang } = useLanguage()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('custom_requests').select('*').order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    await supabase.from('custom_requests').update({ status }).eq('id', id)
  }

  return (
    <>
      <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white border-b border-outline-variant/50 pb-6">
        {t('admin_custom_requests')}
      </h1>

      {loading ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('loading')}</p>
      ) : requests.length === 0 ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('admin_no_requests')}</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-surface-container-lowest rounded-xl shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/20 p-4 flex gap-4">
              {r.reference_image_url && (
                <img src={r.reference_image_url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-body-md text-sm">{r.description}</p>
                {r.preferred_colors && (
                  <p className="font-body-md text-xs text-on-surface-variant mt-1">الألوان: {r.preferred_colors}</p>
                )}
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  {r.customer_name} · {r.phone} ·{' '}
                  {new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US')}
                </p>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r.id, e.target.value)}
                className="h-fit rounded-full px-3 py-1 text-xs font-bold bg-primary-container text-on-primary-container border-0"
              >
                {Object.entries(STATUS_KEYS).map(([value, key]) => (
                  <option key={value} value={value}>{t(key)}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
