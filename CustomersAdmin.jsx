import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'

export default function CustomersAdmin() {
  const { t, lang } = useLanguage()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCustomers(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <>
      <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white border-b border-outline-variant/50 pb-6">
        {t('admin_customers')}
      </h1>

      {loading ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('loading')}</p>
      ) : customers.length === 0 ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('admin_no_customers')}</p>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/20 overflow-hidden">
          {customers.map((c) => (
            <div key={c.id} className="flex justify-between items-center p-4 border-b border-outline-variant/20 last:border-0 hover:bg-surface-container/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
                  {c.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface dark:text-white">{c.name}</p>
                  <p className="font-body-md text-xs text-on-surface-variant">{c.phone} · {c.commune}</p>
                </div>
              </div>
              <span className="font-body-md text-xs text-on-surface-variant">
                {new Date(c.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US')}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
