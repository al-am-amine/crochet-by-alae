import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Decides whether to show the "delivery is currently within Blida only"
// banner. Fail-safe: if we can't confidently tell where the visitor is,
// or the admin has turned the banner off, we show nothing rather than
// risk an incorrect warning.
export function useGeoBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      // 1. Read the admin's ON/OFF toggle for this banner.
      const { data: settings } = await supabase
        .from('site_settings')
        .select('show_delivery_notice')
        .single()

      if (!settings?.show_delivery_notice) return

      // 2. Best-effort IP geolocation. ipapi.co's free tier needs no key.
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        const region = (data?.region || '').toLowerCase()
        const isBlida = region.includes('blida')
        if (!cancelled && !isBlida) setShowBanner(true)
      } catch {
        // Network/geolocation failure -> fail-safe: show nothing.
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  return { showBanner: showBanner && !dismissed, dismiss: () => setDismissed(true) }
}
