/* Security reminder: audit only admin status changes; do not add public visitor tracking. */
import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'
import { logAdminAction } from '../../lib/adminAudit'
import Icon from '../../components/Icon'

const STATUS_KEYS = {
  new: 'order_status_new', preparing: 'order_status_preparing',
  shipped: 'order_status_shipped', delivered: 'order_status_delivered',
}
const STATUS_COLORS = {
  new: 'bg-secondary-container text-on-secondary-container',
  preparing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
}

export default function OrdersAdmin() {
  const { t, lang } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    const previousStatus = orders.find((order) => order.id === id)?.status || null
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: previousStatus } : o)))
      setActionError(t('generic_error'))
      return
    }
    if (previousStatus !== status) {
      await logAdminAction('order_status_updated', { order_id: id, from_status: previousStatus, to_status: status })
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('admin_order_delete_confirm'))) return
    setDeletingId(id)
    setActionError('')
    setActionSuccess('')
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (error) {
        console.error('Order deletion failed', error)
        setActionError(t('admin_delete_error'))
        return
      }

      await logAdminAction('order_deleted', { order_id: id })
      setOrders((prev) => prev.filter((order) => order.id !== id))
      setActionSuccess(t('admin_order_delete_success'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white border-b border-outline-variant/50 pb-6">
        {t('admin_orders')}
      </h1>

      {loading ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('loading')}</p>
      ) : orders.length === 0 ? (
        <p className="font-body-md text-sm text-on-surface-variant">{t('admin_no_orders')}</p>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/20 overflow-x-auto">
          <table className="w-full text-start font-body-md text-body-md">
            <thead>
              <tr className="border-b-2 border-surface-container-high">
                {['المنتج', t('admin_customer'), 'البلدية', t('admin_date'), t('admin_total_amount'), t('admin_status_label'), t('admin_actions')].map((h) => (
                  <th key={h} className="p-3 font-label-sm text-label-sm text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="p-3">{o.product_name}</td>
                  <td className="p-3">
                    {o.customer_name}
                    <div className="text-xs text-on-surface-variant">{o.phone}</div>
                  </td>
                  <td className="p-3">{o.commune}</td>
                  <td className="p-3 text-xs text-on-surface-variant">
                    {new Date(o.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US')}
                  </td>
                  <td className="p-3 font-bold text-primary">{o.total ? `${o.total} د.ج` : '—'}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-bold border-0 ${STATUS_COLORS[o.status] || ''}`}
                    >
                      {Object.entries(STATUS_KEYS).map(([value, key]) => (
                        <option key={value} value={value}>{t(key)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(o.id)}
                      disabled={deletingId === o.id}
                      aria-label={t('admin_delete')}
                      title={t('admin_delete')}
                      className="p-2 rounded-full text-outline hover:bg-surface-container-high hover:text-error transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                      <Icon name="delete" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {actionError && <p role="alert" className="mt-4 font-body-md text-sm text-error">{actionError}</p>}
      {actionSuccess && <p role="status" className="mt-4 font-body-md text-sm text-green-700 dark:text-green-300">{actionSuccess}</p>}
    </>
  )
}
