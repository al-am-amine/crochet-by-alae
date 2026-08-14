/*
  Design reminder: channel marks stay lightweight and hand-drawn-looking,
  with transparent color washes that preserve the original crochet-pink identity.
  Keep the marks recognizable at small sizes and never depend on a font glyph.
*/
import Icon from './Icon'

const CHANNEL_META = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', wash: 'rgba(37, 211, 102, 0.12)' },
  instagram: { label: 'Instagram', color: '#C13584', wash: 'rgba(193, 53, 132, 0.12)' },
  tiktok: { label: 'TikTok', color: '#111827', wash: 'rgba(17, 24, 39, 0.10)' },
  phone: { label: 'Phone', color: '#8D495D', wash: 'rgba(141, 73, 93, 0.12)' },
  link: { label: 'Link', color: '#8D495D', wash: 'rgba(141, 73, 93, 0.12)' },
}

export function getChannelMeta(type) {
  return CHANNEL_META[type] || CHANNEL_META.link
}

export default function ChannelIcon({ type, size = 22, className = '' }) {
  const meta = getChannelMeta(type)

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{ width: size + 16, height: size + 16, color: meta.color, backgroundColor: meta.wash }}
      title={meta.label}
      aria-label={meta.label}
    >
      {type === 'whatsapp' && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20.2 11.4a8.2 8.2 0 0 1-12.1 7.2L4 20l1.5-4A8.2 8.2 0 1 1 20.2 11.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9.3 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.6.7c.6 1.1 1.5 2 2.7 2.6l.6-.6c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.6v.5c0 .3-.1.5-.4.7-.4.2-.9.3-1.3.2-1.7-.3-3.3-1.2-4.5-2.4-1.3-1.2-2.2-2.8-2.5-4.5-.1-.4 0-.9.2-1.3Z" fill="currentColor" />
        </svg>
      )}
      {type === 'instagram' && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.3" y="3.3" width="17.4" height="17.4" rx="4.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="6.7" r="1.1" fill="currentColor" />
        </svg>
      )}
      {type === 'tiktok' && (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14.2 4v8.1a4.6 4.6 0 1 1-3.2-4.4v2.5a2.3 2.3 0 1 0 1 2V4h2.2c.3 1.3 1.2 2.3 2.8 2.8v2.2A6 6 0 0 1 14.2 8V4Z" fill="currentColor" />
        </svg>
      )}
      {type === 'phone' && <Icon name="call" size={size} className="text-current" />}
      {type !== 'whatsapp' && type !== 'instagram' && type !== 'tiktok' && type !== 'phone' && <Icon name="link" size={size} className="text-current" />}
    </span>
  )
}
