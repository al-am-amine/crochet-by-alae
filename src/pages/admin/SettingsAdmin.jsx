/* Security reminder: audit admin setting changes only; never collect storefront visitor telemetry. */
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'
import { uploadImage } from '../../lib/storage'
import { logAdminAction } from '../../lib/adminAudit'

const CHANNEL_ICON = { whatsapp: 'chat', instagram: 'photo_camera', phone: 'call', tiktok: 'music_note' }

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
    </label>
  )
}

export default function SettingsAdmin() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState(null)
  const [channels, setChannels] = useState([])
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  async function load() {
    const [{ data: settingsData }, { data: channelsData }] = await Promise.all([
      supabase.from('site_settings').select('*').single(),
      supabase.from('contact_channels').select('*').order('sort_order'),
    ])
    setSettings(settingsData)
    setChannels(channelsData ?? [])
  }

  useEffect(() => { load() }, [])

  async function saveSettings(next) {
    const merged = { ...settings, ...next }
    setSettings(merged)
    const { id, ...payload } = merged
    const { error } = await supabase.from('site_settings').update(payload).eq('id', 1)
    if (!error) await logAdminAction('settings_updated', { fields: Object.keys(next) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const url = await uploadImage(file, 'logo')
      saveSettings({ logo_url: url })
    } catch (err) {
      console.error(err)
      alert('فشل رفع الشعار — تأكدي من إنشاء bucket باسم product-images فـ Supabase.')
    } finally {
      setUploadingLogo(false)
    }
  }

  function updateChannel(id, field, value) {
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  async function saveChannel(channel) {
    const { error } = await supabase.from('contact_channels')
      .update({ type: channel.type, value: channel.value, enabled: channel.enabled })
      .eq('id', channel.id)
    if (!error) await logAdminAction('contact_channel_updated', { channel_id: channel.id, type: channel.type })
  }

  async function addChannel() {
    const { data } = await supabase.from('contact_channels')
      .insert({ type: 'whatsapp', value: '', enabled: false, sort_order: channels.length })
      .select().single()
    if (data) {
      setChannels((prev) => [...prev, data])
      await logAdminAction('contact_channel_created', { channel_id: data.id, type: data.type })
    }
  }

  async function deleteChannel(id) {
    if (!confirm('تأكيد الحذف؟')) return
    const { error } = await supabase.from('contact_channels').delete().eq('id', id)
    if (!error) await logAdminAction('contact_channel_deleted', { channel_id: id })
    setChannels((prev) => prev.filter((c) => c.id !== id))
  }

  if (!settings) return <p className="font-body-md text-sm text-on-surface-variant">{t('loading')}</p>

  return (
    <>
      <header className="flex items-center justify-between border-b border-outline-variant/50 pb-6">
        <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('admin_settings')}</h1>
        {saved && <span className="font-label-sm text-label-sm text-green-700">{t('admin_settings_saved')}</span>}
      </header>

      {/* Store identity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-4 space-y-2">
          <h3 className="font-headline-md text-headline-md text-primary">{t('admin_identity_title')}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('admin_identity_desc')}</p>
        </div>
        <div className="lg:col-span-8 bg-surface-container-low dark:bg-[#242019] rounded-xl p-gutter shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/30 space-y-gutter">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface dark:text-white mb-unit-2">{t('admin_logo_upload')}</label>
            <label className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center bg-surface dark:bg-[#1A1A1A] hover:bg-surface-container transition-colors cursor-pointer group">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="logo" className="w-20 h-20 rounded-lg object-cover mb-2" />
              ) : (
                <Icon name="cloud_upload" size={36} className="text-outline mb-2 group-hover:text-primary transition-colors" />
              )}
              <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">
                {uploadingLogo ? '...' : t('admin_logo_dropzone')}
              </span>
              <span className="font-body-md text-outline mt-1 text-sm">PNG, JPG {t('admin_logo_maxsize')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>
      </section>

      {/* Contact channels */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-4 space-y-2">
          <h3 className="font-headline-md text-headline-md text-primary">{t('admin_channels_title')}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('admin_channels_desc')}</p>
        </div>
        <div className="lg:col-span-8 bg-surface-container-low dark:bg-[#242019] rounded-xl p-gutter shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/30 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-label-sm text-label-sm text-on-surface dark:text-white">{t('admin_current_channels')}</h4>
            <button
              onClick={addChannel}
              className="bg-surface border border-primary text-primary rounded-lg py-2 px-4 font-label-sm text-label-sm flex items-center gap-2 hover:bg-secondary-container transition-colors"
            >
              <Icon name="add" size={18} />
              {t('admin_add_channel')}
            </button>
          </div>

          {channels.length === 0 ? (
            <p className="font-body-md text-sm text-on-surface-variant">—</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-3 px-2 font-label-sm text-label-sm text-on-surface-variant font-normal">{t('admin_channel_icon')}</th>
                    <th className="py-3 px-2 font-label-sm text-label-sm text-on-surface-variant font-normal">{t('admin_channel_type')}</th>
                    <th className="py-3 px-2 font-label-sm text-label-sm text-on-surface-variant font-normal">{t('admin_channel_value')}</th>
                    <th className="py-3 px-2 font-label-sm text-label-sm text-on-surface-variant font-normal text-center">{t('admin_channel_enabled')}</th>
                    <th className="py-3 px-2 font-label-sm text-label-sm text-on-surface-variant font-normal text-end">{t('admin_action')}</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface dark:text-white">
                  {channels.map((c) => (
                    <tr key={c.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-2">
                        <div className="w-10 h-10 rounded bg-surface flex items-center justify-center text-primary shadow-sm">
                          <Icon name={CHANNEL_ICON[c.type] || 'link'} size={20} />
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <select
                          value={c.type}
                          onChange={(e) => updateChannel(c.id, 'type', e.target.value)}
                          onBlur={() => saveChannel(c)}
                          className="bg-transparent border border-outline-variant rounded-lg p-2 text-sm"
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="instagram">Instagram</option>
                          <option value="phone">{t('order_via_phone')}</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </td>
                      <td className="py-4 px-2">
                        <input
                          dir="ltr"
                          value={c.value}
                          onChange={(e) => updateChannel(c.id, 'value', e.target.value)}
                          onBlur={() => saveChannel(c)}
                          placeholder={c.type === 'whatsapp' ? '2135XXXXXXXX' : 'https://...'}
                          className="bg-transparent border border-outline-variant rounded-lg p-2 text-sm w-full text-left"
                        />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Toggle
                          checked={c.enabled}
                          onChange={(val) => {
                            updateChannel(c.id, 'enabled', val)
                            saveChannel({ ...c, enabled: val })
                          }}
                        />
                      </td>
                      <td className="py-4 px-2 text-end">
                        <button onClick={() => deleteChannel(c.id)} className="text-outline hover:text-error transition-colors p-2">
                          <Icon name="delete" size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Preferences */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start pb-section-gap">
        <div className="lg:col-span-4 space-y-2">
          <h3 className="font-headline-md text-headline-md text-primary">{t('admin_preferences_title')}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('admin_preferences_desc')}</p>
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-low dark:bg-[#242019] rounded-xl p-6 shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/30 flex justify-between items-center">
            <div>
              <span className="block font-label-sm text-label-sm text-on-surface dark:text-white">{t('admin_delivery_notice_toggle')}</span>
              <span className="block font-body-md text-on-surface-variant text-sm mt-1">({t('feature_delivery')})</span>
            </div>
            <Toggle checked={settings.show_delivery_notice} onChange={(v) => saveSettings({ show_delivery_notice: v })} />
          </div>

          <div className="bg-surface-container-low dark:bg-[#242019] rounded-xl p-6 shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/30 flex justify-between items-center">
            <span className="font-label-sm text-label-sm text-on-surface dark:text-white">{t('admin_default_show_price')}</span>
            <Toggle checked={settings.show_price_default} onChange={(v) => saveSettings({ show_price_default: v })} />
          </div>

          <div className="bg-surface-container-low dark:bg-[#242019] rounded-xl p-6 shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/30">
            <label className="block font-label-sm text-label-sm text-on-surface dark:text-white mb-3">{t('admin_default_language')}</label>
            <div className="relative">
              <select
                value={settings.default_language}
                onChange={(e) => saveSettings({ default_language: e.target.value })}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 pe-10 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English (الإنجليزية)</option>
              </select>
              <Icon name="expand_more" size={20} className="absolute start-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            </div>
          </div>

          <div className="bg-surface-container-low dark:bg-[#242019] rounded-xl p-6 shadow-[0_20px_20px_rgba(212,132,154,0.03)] border border-outline-variant/30">
            <label className="block font-label-sm text-label-sm text-on-surface dark:text-white mb-3">{t('admin_default_theme')}</label>
            <div className="relative">
              <select
                value={settings.default_theme}
                onChange={(e) => saveSettings({ default_theme: e.target.value })}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 pe-10 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
              >
                <option value="light">{t('theme_light')}</option>
                <option value="dark">{t('theme_dark')}</option>
              </select>
              <Icon name="expand_more" size={20} className="absolute start-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
