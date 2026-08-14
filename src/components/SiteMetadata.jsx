/*
  Style reminder: metadata should quietly carry the same uploaded crochet mark
  into browser chrome and social previews without changing the page layout.
*/
import { useEffect } from 'react'
import { useSiteSettings } from '../lib/SiteSettingsContext'

function setMeta(attribute, value, content) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export default function SiteMetadata() {
  const { logoUrl } = useSiteSettings()

  useEffect(() => {
    let favicon = document.head.querySelector('link[data-brand-favicon]')
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.dataset.brandFavicon = 'true'
      document.head.appendChild(favicon)
    }
    favicon.href = logoUrl
    setMeta('property', 'og:image', logoUrl)
    setMeta('name', 'twitter:image', logoUrl)
  }, [logoUrl])

  return null
}
