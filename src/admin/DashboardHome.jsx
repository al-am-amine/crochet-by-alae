import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'

const STATUS_STYLE = {
  new: 'bg-secondary-container text-on-secondary-container',
  preparing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
}
const STATUS_KEYS = {
  new: 'order_status_new', preparing: 'order_status_preparing',
  shipped: 'order_status_shipped', delivered: 'order_status_delivered',
}

export default function DashboardHome() {
  const { t, lang } = useLanguage()
  const [stats, setStats] = useState({ newOrders: 0, products: 0, newRequests: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    async function load() {
      const [{ count: newOrders }, { count: products }, { count: newRequests }, { data: recent }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('custom_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ newOrders: newOrders ?? 0, products: products ?? 0, newRequests: newRequests ?? 0 })
      setRecentOrders(recent ?? [])
    }
    load()
  }, [])

  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/50 pb-6 relative">
        <div>
          <h1 className="font-display-lg text-headline-lg md:text-display-lg text-primary mb-2 tracking-tight">
            {t('admin_overview_title')}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{t('admin_overview_subtitle')}</p>
        </div>
        <div className="font-label-sm text-label-sm text-outline flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
          <Icon name="calendar_today" size={18} />
          <span>{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[
          { icon: 'shopping_basket', value: stats.newOrders, label: t('admin_stat_orders'), bg: 'bg-secondary-container text-on-secondary-container' },
          { icon: 'inventory', value: stats.products, label: t('admin_stat_products'), bg: 'bg-surface-variant text-on-surface-variant' },
          { icon: 'auto_awesome', value: stats.newRequests, label: t('admin_stat_requests'), bg: 'bg-primary-container text-on-primary-container' },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/20 hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon name={card.icon} size={22} />
              </div>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-white mb-1">{card.value}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="bg-surface-container-lowest rounded-xl p-gutter shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline-md text-headline-md text-primary">{t('admin_recent_orders')}</h2>
          <Link to="/admin/orders" className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-colors flex items-center gap-1">
            {t('admin_view_all')}
            <Icon name="arrow_forward" size={18} className="rtl:rotate-180" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="font-body-md text-sm text-on-surface-variant">{t('admin_no_orders')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b-2 border-surface-container-high">
                  {[t('admin_customer'), t('admin_date'), t('admin_total_amount'), t('admin_status_label')].map((h) => (
                    <th key={h} className="py-4 px-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-start">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-body-md text-body-md">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-container/50 transition-colors duration-200">
                    <td className="py-4 px-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-sm shrink-0">
                        {o.customer_name?.[0] || '?'}
                      </div>
                      <span className="font-bold text-on-surface dark:text-white">{o.customer_name}</span>
                    </td>
                    <td className="py-4 px-2 text-on-surface-variant">
                      {new Date(o.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US')}
                    </td>
                    <td className="py-4 px-2 font-bold text-primary">{o.total ? `${o.total} د.ج` : '—'}</td>
                    <td className="py-4 px-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold ${STATUS_STYLE[o.status] || ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {t(STATUS_KEYS[o.status] || 'order_status_new')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
