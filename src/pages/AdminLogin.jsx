/*
  Security reminder: this page audits only attempts to enter the admin area;
  it does not inspect or track public storefront visitors.
*/
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { ADMIN_EMAIL, checkAdminLoginGate, getAdminAttemptContext, logAdminLoginAttempt } from '../lib/adminAudit'

export default function AdminLogin() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(() => Number(sessionStorage.getItem('admin_failed_attempts') || 0))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const normalizedEmail = email.trim().toLowerCase()
    const gate = await checkAdminLoginGate(normalizedEmail)
    if (!gate.allowed) {
      setLoading(false)
      setError(t('admin_login_rate_limited'))
      return
    }
    const attemptContext = getAdminAttemptContext()
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
    setLoading(false)
    if (error) {
      const nextAttempts = failedAttempts + 1
      setFailedAttempts(nextAttempts)
      sessionStorage.setItem('admin_failed_attempts', String(nextAttempts))
      await logAdminLoginAttempt({ email: normalizedEmail, success: false, details: { reason: 'invalid_credentials', ...attemptContext } })
      setError(t('admin_login_error'))
      return
    }

    const isAllowedAdmin = data.session?.user?.email?.trim().toLowerCase() === ADMIN_EMAIL
    if (!isAllowedAdmin) {
      await logAdminLoginAttempt({ email: normalizedEmail, success: false, details: { reason: 'unauthorized_account', ...attemptContext } })
      await supabase.auth.signOut()
      setError(t('admin_login_not_authorized'))
      return
    }

    await logAdminLoginAttempt({ email: normalizedEmail, success: true, details: { reason: 'password_login', ...attemptContext } })
    sessionStorage.removeItem('admin_failed_attempts')
    setFailedAttempts(0)
    navigate('/admin')
  }

  return (
    <div className="bg-[#FDF5E6] dark:bg-[#1A1A1A] min-h-screen flex items-center justify-center p-gutter font-body-md text-on-background dark:text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 rounded-full bg-secondary-container blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-primary-container blur-3xl opacity-20 pointer-events-none" />

      <main className="w-full max-w-md relative z-10">
        <div className="bg-surface dark:bg-[#242019] rounded-xl shadow-[0_30px_30px_rgba(212,132,154,0.04)] border border-outline-variant/30 p-margin-edge overflow-hidden relative transition-all duration-300 hover:shadow-[0_40px_40px_rgba(212,132,154,0.06)] hover:-translate-y-1">
          <div className="text-center mb-10">
            <h1 className="font-headline-lg text-headline-lg text-primary italic mb-2 tracking-tight">Crochet by Alae</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{t('admin_login_title')}</p>
            <p className="mt-3 text-xs leading-5 text-on-surface-variant/75">{t('admin_login_audit_notice')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">{t('admin_email')}</label>
              <div className="relative">
                <Icon name="person" size={20} className="absolute inset-y-0 end-3 flex items-center text-outline pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-3 pe-10 py-3 bg-[#FDF5E6] dark:bg-[#1A1A1A] border border-outline-variant rounded-lg text-on-background dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">{t('admin_password')}</label>
              <div className="relative">
                <Icon name="lock" size={20} className="absolute inset-y-0 end-3 flex items-center text-outline pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-3 pe-10 py-3 bg-[#FDF5E6] dark:bg-[#1A1A1A] border border-outline-variant rounded-lg text-on-background dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body-md"
                />
                <button
                  type="button"
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 start-3 flex items-center text-outline hover:text-primary transition-colors"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-error" role="alert">{error}</p>}
            {failedAttempts >= 3 && (
              <p className="text-sm text-secondary" role="status">{t('admin_repeated_failures_warning')}</p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-on-primary-container text-on-primary font-label-sm text-label-sm py-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2 group disabled:opacity-50 motion-press"
              >
                <span>{t('admin_login_btn')}</span>
                <Icon name="arrow_forward" className="group-hover:-translate-x-1 transition-transform rtl:rotate-180" size={20} />
              </button>
            </div>
          </form>

          <div className="mt-8 flex justify-center opacity-50">
            <div className="w-16 stitch-divider" />
          </div>
        </div>

        <div className="mt-8 text-center text-on-surface-variant/60 font-label-sm text-label-sm">
          <p>{t('footer_copyright')}</p>
        </div>
      </main>
    </div>
  )
}
