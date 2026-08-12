/*
  Style reminder: “خيط هادئ” — preserve the existing Crochet by Alae palette,
  typography, icons, and layout; this component only adds restrained opacity
  and transform motion with an accessible reduced-motion fallback.
*/
import { useEffect, useRef, useState } from 'react'

export default function Reveal({ as: Element = 'div', children, className = '', delay = 0, ...props }) {
  const elementRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined

    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const delayValue = Math.max(0, Math.min(Number(delay) || 0, 240))

  return (
    <Element
      ref={elementRef}
      className={`reveal-on-scroll ${visible ? 'is-visible' : ''} ${className}`.trim()}
      data-reveal-delay={delayValue}
      {...props}
    >
      {children}
    </Element>
  )
}
