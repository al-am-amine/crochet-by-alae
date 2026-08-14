/*
  Design reminder: keep the original warm crochet identity while making the
  admin controls compact, calm, keyboard-accessible, and visible on every
  admin surface without competing with the page content.
*/
import Icon from './Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { useTheme } from '../lib/ThemeContext'

export default function AdminControls() {
  const { t, lang, toggleLang } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-low px-2 py-1 shadow-sm" aria-label={t('admin_controls_label')}>
      <button
        type="button"
        onClick={toggleLang}
        aria-label={t('admin_toggle_language')}
        title={t('admin_toggle_language')}
        className="motion-press rounded-full px-2 py-1 text-xs font-bold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {lang === 'ar' ? 'EN' : 'AR'}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t(theme === 'light' ? 'admin_theme_to_dark' : 'admin_theme_to_light')}
        title={t(theme === 'light' ? 'admin_theme_to_dark' : 'admin_theme_to_light')}
        className="motion-press flex h-8 w-8 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Icon name={theme === 'light' ? 'dark_mode' : 'light_mode'} size={18} />
      </button>
    </div>
  )
}
