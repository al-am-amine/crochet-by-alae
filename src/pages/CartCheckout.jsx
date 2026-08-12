import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import GeoBanner from '../components/GeoBanner'
import Icon from '../components/Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { useCart } from '../lib/CartContext'
import { supabase } from '../lib/supabaseClient'
import { getEnabledChannels, sendOrderViaChannel } from '../lib/contactChannels'
import { sendOrderNotification } from '../lib/email'
import { DELIVERY_OPTIONS } from '../lib/deliveryAreas'

const CHANNEL_STYLE = {
  whatsapp: { icon: 'chat', className: 'bg-[#25D366] text-white hover:bg-opacity-90' },
  instagram: {
    icon: 'photo_camera',
    className: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-90',
  },
  phone: { icon: 'call', className: 'border border-primary text-primary bg-surface hover:bg-primary-container hover:text-on-primary-container' },
  tiktok: { icon: 'music_note', className: 'bg-black text-white hover:bg-opacity-90' },
}
const CHANNEL_LABELS = { whatsapp: 'order_via_whatsapp', instagram: 'order_via_instagram', phone: 'order_via_phone' }

export default function CartCheckout() {
  const { t, lang } = useLanguage()
  const { items, updateQty, removeItem, total, clearCart } = useCart()

  const [channels, setChannels] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', email: '', commune: '', address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    getEnabledChannels().then(setChannels)
  }, [])

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const emailIsValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    return Boolean(form.name.trim() && form.phone.trim() && form.commune && form.address.trim() && items.length > 0 && emailIsValid)
  }

  async function handleSubmit(channel) {
    if (!validate()) {
      setFeedback({ type: 'error', message: t('fill_required_fields') })
      return
    }
    setSubmitting(true)
    setFeedback(null)

    try {
      const rows = items.map((item) => ({
        product_id: item.productId,
        product_name: item.name,
        color: item.color || null,
        size: item.size || null,
        notes: [item.notes, item.qty > 1 ? `quantity=${item.qty}` : null].filter(Boolean).join(' | ') || null,
        customer_name: form.name,
        phone: form.phone,
        email: form.email || null,
        commune: form.commune,
        address: form.address,
        total: item.showPrice ? Number(item.price || 0) * Number(item.qty || 0) : null,
        channel: channel.type,
      }))
      const { error: orderError } = await supabase.from('orders').insert(rows)
      if (orderError) throw orderError

      const { error: customerError } = await supabase.from('customers').upsert(
        { name: form.name, phone: form.phone, commune: form.commune },
        { onConflict: 'phone' },
      )
      if (customerError) throw customerError

      const productSummary = items
        .map((i) => `${i.name}${i.color ? ` (${i.color})` : ''}${i.size ? ` - ${i.size}` : ''} x${i.qty}`)
        .join('، ')

      const result = (await sendOrderViaChannel(channel, {
        productName: productSummary,
        customerName: form.name,
        commune: form.commune,
        address: form.address,
      })) || { copied: false }

      void sendOrderNotification({
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        commune: form.commune,
        address: form.address,
        orderSummary: productSummary,
        total: total || null,
      })

      clearCart()
      setFeedback({
        type: 'success',
        message: result.copied ? `${t('order_success')} ${t('copied_paste_hint')}` : t('order_success'),
      })
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: t('generic_error') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-container-max mx-auto px-5 md:px-margin-edge py-12 md:py-section-gap">
        <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface dark:text-white mb-8">
          {t('cart_title')}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body-md text-on-surface-variant mb-4">{t('cart_empty')}</p>
            <Link to="/shop" className="text-primary font-label-sm text-label-sm underline">
              {t('browse_shop')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Items */}
            <div className="lg:col-span-7 space-y-gutter">
              <GeoBanner />

              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.color || ''}-${item.size || ''}`}
                  className="bg-surface-container-low rounded-xl p-unit-4 flex gap-unit-4 shadow-[0_20px_30px_rgba(212,132,154,0.03)] hover:shadow-[0_25px_35px_rgba(212,132,154,0.06)] transition-shadow duration-300 items-center"
                >
                  <img src={item.image} alt={item.name || t('brand')} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-label-sm text-label-sm text-on-surface dark:text-white">{item.name}</p>
                    <p className="font-body-md text-sm text-on-surface-variant">
                      {[item.color, item.size].filter(Boolean).join('، ')}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => updateQty(idx, item.qty + 1)}
                        aria-label={t('increase_quantity')}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container-high"
                      >
                        +
                      </button>
                      <span className="font-body-md text-sm w-4 text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(idx, item.qty - 1)}
                        aria-label={t('decrease_quantity')}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container-high"
                      >
                        −
                      </button>
                    </div>
                  </div>
                  <p className="font-label-sm text-label-sm text-primary whitespace-nowrap">
                    {item.showPrice
                      ? `${(item.price * item.qty).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')} ${lang === 'ar' ? 'د.ج' : 'DZD'}`
                      : t('price_on_request')}
                  </p>
                  <button type="button" onClick={() => removeItem(idx)} aria-label={t('remove_item')} className="text-outline hover:text-error transition-colors p-unit-2">
                    <Icon name="delete_outline" size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order form & summary */}
            <div className="lg:col-span-5 bg-surface-container rounded-xl p-gutter shadow-[0_30px_50px_rgba(212,132,154,0.05)] lg:-translate-y-4">
              <h2 className="font-label-sm text-label-sm text-on-surface dark:text-white mb-gutter pb-unit-2 border-b border-outline-variant">
                {t('order_details_title')}
              </h2>

              <div className="space-y-unit-4 mb-gutter">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">{t('full_name')}</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder={t('full_name_placeholder')}
                    className="bg-surface border border-outline-variant rounded-lg p-unit-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">{t('phone_whatsapp')}</label>
                  <input
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder={t('phone_placeholder')}
                    className="bg-surface border border-outline-variant rounded-lg p-unit-2 font-body-md text-body-md text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">{t('email_label')}</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder={t('email_placeholder')}
                    className="bg-surface border border-outline-variant rounded-lg p-unit-2 font-body-md text-body-md text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">{t('commune_label')}</label>
                  <select
                    value={form.commune}
                    onChange={(e) => updateForm('commune', e.target.value)}
                    className="bg-surface border border-outline-variant rounded-lg p-unit-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="">{t('commune_placeholder')}</option>
                    {DELIVERY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{lang === 'ar' ? option.labelAr : option.labelEn}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">{t('address_label')}</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    placeholder={t('address_placeholder')}
                    rows={2}
                    className="bg-surface border border-outline-variant rounded-lg p-unit-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="bg-surface rounded-lg p-unit-4 space-y-unit-2 mb-gutter border border-outline-variant/30">
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold">{t('total_label')}</span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {total.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')} {lang === 'ar' ? 'د.ج' : 'DZD'}
                  </span>
                </div>
              </div>

              {feedback && (
                <p className={`font-body-md text-sm mb-gutter ${feedback.type === 'error' ? 'text-error' : 'text-green-700'}`}>
                  {feedback.message}
                </p>
              )}

              <div className="space-y-unit-2">
                <p className="font-label-sm text-label-sm text-center text-on-surface-variant mb-unit-2">
                  {t('choose_channel')}
                </p>
                {channels.map((c, i) => {
                  const style = CHANNEL_STYLE[c.type] || {}
                  return (
                    <button
                      key={i}
                      disabled={submitting}
                      onClick={() => handleSubmit(c)}
                      className={`w-full flex items-center justify-center gap-unit-2 rounded-lg py-3 transition-all font-label-sm text-label-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 ${style.className || 'bg-primary text-on-primary'}`}
                    >
                      <Icon name={style.icon || 'send'} size={20} />
                      {t(CHANNEL_LABELS[c.type] || 'submit_order')}
                    </button>
                  )
                })}
                {channels.length === 0 && (
                  <p className="font-body-md text-xs text-on-surface-variant text-center">
                    {t('no_channels_configured')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
