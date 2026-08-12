/*
  Style reminder: “خيط هادئ” — keep the original quiet footer hierarchy and
  palette; only improve navigation semantics and reliable contact links.
*/
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { getEnabledChannels } from '../lib/contactChannels'

const CHANNEL_ICONS = { whatsapp: 'chat', instagram: 'photo_camera', phone: 'call', tiktok: 'music_note' }

function channelHref(channel) {
  const value = String(channel.value || '').trim()
  if (channel.type === 'phone') return `tel:${value}`
  if (channel.type === 'whatsapp') {
    return /^https?:\/\//i.test(value) ? value : `https://wa.me/${value.replace(/\D/g, '')}`
  }
  if (channel.type === 'instagram' && !/^https?:\/\//i.test(value)) {
    return `https://instagram.com/${value.replace(/^@/, '')}`
  }
  if (channel.type === 'tiktok' && !/^https?:\/\//i.test(value)) {
    return `https://www.tiktok.com/@${value.replace(/^@/, '')}`
  }
  return value
}

export default function Footer() {
  const { t } = useLanguage()
  const [channels, setChannels] = useState([])

  useEffect(() => {
    getEnabledChannels().then(setChannels)
  }, [])

  return (
    <footer className="w-full py-section-gap px-5 md:px-margin-edge flex flex-col md:flex-row-reverse justify-between items-center gap-6 bg-surface-container-low dark:bg-[#211a17] border-t border-outline-variant/40 mt-section-gap">
      <div className="text-center md:text-right">
        <div className="font-headline-md text-headline-md text-primary mb-2">{t('brand')}</div>
        <p className="font-body-md text-body-md text-secondary">{t('footer_copyright')}</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-2 opacity-80">
          {t('footer_delivery_note')}
        </p>
      </div>

      <div className="flex flex-col items-center md:items-end gap-4">
        <div className="flex gap-6">
          <Link to="/shipping" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            {t('footer_shipping')}
          </Link>
          <Link to="/faq" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            {t('footer_faq')}
          </Link>
        </div>

        {channels.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="font-label-sm text-label-sm text-on-surface-variant">{t('footer_contact_us')}</span>
            {channels.map((c, i) => (
              <a
                key={c.id || `${c.type}-${c.value}`}
                href={channelHref(c)}
                target={c.type === 'phone' ? undefined : '_blank'}
                rel={c.type === 'phone' ? undefined : 'noreferrer'}
                aria-label={c.type}
              >
                <Icon name={CHANNEL_ICONS[c.type] || 'link'} size={20} className="text-primary hover:opacity-70 transition-opacity" />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
