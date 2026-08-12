/*
  Style reminder: “خيط هادئ” — retain the original shop hierarchy, colors,
  rounded controls, and product grid; motion should clarify state changes only.
*/
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import GeoBanner from '../components/GeoBanner'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabaseClient'

export default function Shop() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })

      const filter = searchParams.get('filter')
      if (filter === 'new') query = query.limit(12)

      const { data } = await query
      setProducts(data ?? [])
      setCategories([...new Set((data ?? []).map((p) => p.category).filter(Boolean))])
      setLoading(false)
    }
    load()
  }, [searchParams])

  const visible =
    activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen page-shell">
      <Header />

      <main className="max-w-container-max mx-auto px-5 md:px-margin-edge py-section-gap min-h-screen">
        <Reveal as="div" className="flex flex-col items-center mb-section-gap text-center space-y-6">
          <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface dark:text-white">
            {t('nav_shop_all')}
          </h1>
          <div className="w-24 stitch-divider mx-auto" />

          <div className="px-5 md:px-0 w-full">
            <GeoBanner />
          </div>

          <div className="flex flex-wrap justify-center gap-unit pt-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2 rounded-full font-label-sm text-label-sm transition-all ${
                activeCategory === 'all'
                  ? 'bg-primary text-on-primary shadow-sm scale-105'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {t('filter_all')}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-6 py-2 rounded-full font-label-sm text-label-sm transition-all ${
                  activeCategory === c
                    ? 'bg-primary text-on-primary shadow-sm scale-105'
                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        {loading ? (
          <p className="text-center text-sm text-on-surface-variant py-16">{t('loading')}</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-16">{t('no_products_yet')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
