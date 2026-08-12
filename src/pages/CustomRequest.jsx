import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { uploadImage } from '../lib/storage'
import { getEnabledChannels, sendOrderViaChannel } from '../lib/contactChannels'

const CHANNEL_STYLE = {
  whatsapp: { icon: 'send', className: 'bg-primary text-on-primary hover:bg-primary-container' },
  instagram: {
    icon: 'photo_camera',
    className: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-90',
  },
  phone: { icon: 'call', className: 'border border-primary text-primary bg-surface hover:bg-primary-container' },
  tiktok: { icon: 'music_note', className: 'bg-black text-white hover:bg-opacity-90' },
}
const CHANNEL_LABELS = { whatsapp: 'order_via_whatsapp', instagram: 'order_via_instagram', phone: 'order_via_phone' }

export default function CustomRequest() {
  const { t } = useLanguage()
  const [channels, setChannels] = useState([])
  const [description, setDescription] = useState('')
  const [colors, setColors] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    getEnabledChannels().then(setChannels)
  }, [])

  function validate() {
    return description && name && phone
  }

  async function handleSubmit(channel) {
    if (!validate()) {
      setFeedback({ type: 'error', message: t('fill_required_fields') })
      return
    }
    setSubmitting(true)
    setFeedback(null)

    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'custom-requests')
      }

      await supabase.from('custom_requests').insert({
        description,
        reference_image_url: imageUrl,
        preferred_colors: colors || null,
        customer_name: name,
        phone,
      })

      const result = await sendOrderViaChannel(channel, {
        productName: `طلب تصميم مخصص: ${description}`,
        notes: colors ? `الألوان المفضلة: ${colors}` : null,
        customerName: name,
      })

      setDescription('')
      setColors('')
      setName('')
      setPhone('')
      setImageFile(null)
      setFeedback({
        type: 'success',
        message: result.copied ? `${t('custom_success')} ${t('copied_paste_hint')}` : t('custom_success'),
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

      <main className="flex-grow pt-6 pb-section-gap px-5 md:px-margin-edge max-w-container-max mx-auto w-full relative">
        <div className="absolute top-20 right-10 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Intro */}
          <div className="lg:col-span-5 lg:col-start-1 lg:pl-12 flex flex-col gap-6 lg:sticky lg:top-32">
            <h1 className="font-display-lg text-headline-lg md:text-display-lg text-primary mb-2">
              {t('custom_page_title')}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {t('custom_page_subtitle_long')}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              {t('custom_page_subtitle_short')}
            </p>
            <div className="mt-4 relative h-64 w-full rounded-2xl overflow-hidden shadow-[0_30px_30px_rgba(212,132,154,0.1)] group">
              <img
                src="https://placehold.co/800x600/f5c6d0/79545d?text=Crochet+by+Alae"
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 lg:col-start-7 bg-surface-bright dark:bg-[#242019] p-6 md:p-12 rounded-3xl shadow-[0_30px_30px_rgba(212,132,154,0.04)] border border-surface-container-high mt-12 lg:mt-0">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface dark:text-white">
                  {t('custom_description_label')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('custom_description_placeholder')}
                  rows={5}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface dark:text-white">
                  {t('custom_image_label')}
                </label>
                <div className="relative w-full h-32 bg-surface border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-container hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <Icon name="add_photo_alternate" className="text-outline group-hover:text-primary transition-colors" size={30} />
                  <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors text-center px-4">
                    {imageFile ? imageFile.name : t('custom_image_dropzone')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface dark:text-white">{t('custom_colors_label')}</label>
                  <input
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder={t('custom_colors_placeholder')}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface dark:text-white">{t('full_name')}</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('full_name_placeholder')}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface dark:text-white">{t('phone_whatsapp')}</label>
                <div className="relative">
                  <input
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phone_placeholder')}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md text-on-surface dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
                  />
                  <Icon name="phone_iphone" size={20} className="absolute end-4 top-1/2 -translate-y-1/2 text-outline-variant" />
                </div>
              </div>

              {feedback && (
                <p className={`font-body-md text-sm ${feedback.type === 'error' ? 'text-error' : 'text-green-700'}`}>
                  {feedback.message}
                </p>
              )}

              <div className="flex flex-col gap-3">
                {channels.map((c, i) => {
                  const style = CHANNEL_STYLE[c.type] || {}
                  return (
                    <button
                      key={i}
                      disabled={submitting}
                      onClick={() => handleSubmit(c)}
                      className={`w-full font-label-sm text-label-sm py-4 px-8 rounded-lg flex items-center justify-center gap-3 hover:shadow-lg transition-all duration-300 group disabled:opacity-50 ${style.className || 'bg-primary text-on-primary'}`}
                    >
                      <Icon name={style.icon || 'send'} className="group-hover:scale-110 transition-transform" size={20} />
                      {t(CHANNEL_LABELS[c.type] || 'custom_submit')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
