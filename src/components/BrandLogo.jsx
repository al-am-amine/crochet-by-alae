/*
  Style reminder: present the uploaded “AA” crochet mark as a tactile circular
  seal, clip its opaque corners cleanly, and keep any wordmark secondary to the
  original visual identity across light, dark, RTL, and LTR surfaces.
*/
import { useEffect, useState } from 'react'
import Icon from './Icon'
import { useSiteSettings } from '../lib/SiteSettingsContext'

export default function BrandLogo({ label = 'Crochet by Alae', showLabel = false, className = '', imgClassName = 'h-10 w-10' }) {
  const { logoUrl } = useSiteSettings()
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => setImageFailed(false), [logoUrl])

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label={label}>
      {logoUrl && !imageFailed ? (
        <img
          src={logoUrl}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => setImageFailed(true)}
          className={`shrink-0 rounded-full object-cover bg-[#f6d7df] ring-1 ring-primary/15 shadow-sm ${imgClassName}`}
        />
      ) : (
        <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container ring-1 ring-primary/15 ${imgClassName}`}>
          <Icon name="storefront" size={22} />
        </span>
      )}
      {showLabel && <span className="font-headline-md text-headline-md text-primary italic tracking-tight">{label}</span>}
    </span>
  )
}
