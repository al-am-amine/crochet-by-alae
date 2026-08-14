/*
  Style reminder: site identity stays warm, restrained, and unmistakably tied
  to the uploaded crochet mark; keep the shared logo URL reactive and avoid
  replacing it with a generic placeholder.
*/
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export const FALLBACK_LOGO_URL = 'https://ikgxaxanhxgnsadkawuz.supabase.co/storage/v1/object/public/product-images/logo/bb5f2307-8df2-49aa-b77a-26066e55a60c.png'

const SiteSettingsContext = createContext({ logoUrl: FALLBACK_LOGO_URL, refreshSiteSettings: async () => {} })

export function SiteSettingsProvider({ children }) {
  const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO_URL)

  const refreshSiteSettings = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('logo_url').eq('id', 1).maybeSingle()
    if (data?.logo_url) setLogoUrl(data.logo_url)
  }, [])

  useEffect(() => {
    refreshSiteSettings()
    const onSettingsUpdated = () => refreshSiteSettings()
    window.addEventListener('site-settings-updated', onSettingsUpdated)
    return () => window.removeEventListener('site-settings-updated', onSettingsUpdated)
  }, [refreshSiteSettings])

  return <SiteSettingsContext.Provider value={{ logoUrl, refreshSiteSettings }}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
