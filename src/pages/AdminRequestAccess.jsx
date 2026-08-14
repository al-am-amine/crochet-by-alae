/*
  Design reminder: this public application keeps the original warm storefront
  identity, uses restrained reveal motion, and sends the password only to
  Supabase Auth; the owner receives review details, never the password.
*/
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import AdminControls from '../components/AdminControls'
import BrandLogo from '../components/BrandLogo'
import { useLanguage } from '../i18n/LanguageContext'
import { registerAdminAccessRequest } from '../lib/adminAccessRequests'

export default function AdminRequestAccess() {
  const { t } = useLanguage()
  const [form, setForm] = useState({ fullName: '', familyName: '', email: '', password: '', additionalInfo: '' })
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    if (form.password.length < 8) {
      setLoading(false)
      setError(t('admin_request_password_length'))
      return
    }
    const { data, error: invokeError } = await registerAdminAccessRequest({
      ...form,
    })
    setLoading(false)
    if (invokeError || data?.error) {
      setError(invokeError?.message || data?.error || t('admin_request_error'))
      return
    }
    setNotice(data?.emailConfirmationRequired ? t('admin_request_submitted_verify') : t('admin_request_submitted'))
    setForm({ fullName: '', familyName: '', email: '', password: '', additionalInfo: '' })
  }

  return (
    <div className="min-h-screen bg-[#FDF5E6] dark:bg-[#1A1A1A] flex items-center justify-center p-5 text-on-background dark:text-white">
      <main className="w-full max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-primary transition hover:opacity-75">
            <Icon name="arrow_back" size={18} />
            {t('admin_back_login')}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-on-surface-variant">{t('footer_copyright')}</span>
            <AdminControls />
          </div>
        </div>
        <section className="rounded-2xl border border-outline-variant/30 bg-surface dark:bg-[#242019] p-6 shadow-[0_26px_60px_rgba(68,44,33,0.10)] md:p-10">
          <BrandLogo label={t('brand')} showLabel imgClassName="h-14 w-14" className="mb-6" />
          <div className="mb-8 border-b border-outline-variant/30 pb-6">
            <div className="mb-3 flex items-center gap-3 text-primary">
              <Icon name="person_add" size={26} />
              <h1 className="font-headline-lg text-headline-lg italic">{t('admin_request_title')}</h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-on-surface-variant">{t('admin_request_description')}</p>
          </div>

          {error && <p className="mb-5 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="alert">{error}</p>}
          {notice && <p className="mb-5 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary" role="status">{notice}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold text-on-surface-variant">
                {t('admin_request_first_name')}
                <input required value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} autoComplete="given-name" className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-on-background outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="text-sm font-semibold text-on-surface-variant">
                {t('admin_request_family_name')}
                <input required value={form.familyName} onChange={(event) => updateField('familyName', event.target.value)} autoComplete="family-name" className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-on-background outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
            </div>
            <label className="block text-sm font-semibold text-on-surface-variant">
              {t('admin_email')}
              <input type="email" required value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" placeholder="name@example.com" className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-on-background outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="block text-sm font-semibold text-on-surface-variant">
              {t('admin_password')}
              <input type="password" required minLength={8} value={form.password} onChange={(event) => updateField('password', event.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-on-background outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <span className="mt-2 block text-xs font-normal leading-5 text-on-surface-variant">{t('admin_request_password_once_note')}</span>
            </label>
            <label className="block text-sm font-semibold text-on-surface-variant">
              {t('admin_request_additional_info')}
              <textarea maxLength={1000} value={form.additionalInfo} onChange={(event) => updateField('additionalInfo', event.target.value)} placeholder={t('admin_request_additional_info_placeholder')} className="mt-2 h-12 min-h-0 w-full resize-none rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-on-background outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <span className="mt-2 block text-xs font-normal leading-5 text-on-surface-variant">{t('admin_request_additional_info_note')}</span>
            </label>
            <p className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-xs leading-6 text-on-surface-variant">{t('admin_request_owner_permissions_note')}</p>
            <button type="submit" disabled={loading} className="motion-press inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-label-sm text-label-sm text-on-primary transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
              <Icon name="send" size={19} />
              {loading ? t('loading') : t('admin_request_submit')}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
