import Icon from './Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { useGeoBanner } from '../lib/useGeoBanner'

export default function GeoBanner() {
  const { t } = useLanguage()
  const { showBanner, dismiss } = useGeoBanner()

  if (!showBanner) return null

  return (
    <div className="bg-secondary-container/30 text-on-secondary-container p-unit-4 rounded-lg flex items-center justify-between gap-unit-2 shadow-[0_10px_20px_rgba(212,132,154,0.02)]">
      <div className="flex items-center gap-unit-2">
        <Icon name="local_shipping" className="text-primary" size={20} />
        <p className="font-body-md text-body-md m-0">{t('geo_banner_text')}</p>
      </div>
      <button onClick={dismiss} aria-label="close">
        <Icon name="close" className="text-on-surface-variant hover:text-primary transition-colors" size={18} />
      </button>
    </div>
  )
}
