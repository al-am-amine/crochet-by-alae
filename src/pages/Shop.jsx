/*
  Style reminder: “خيط هادئ” — retain the original shop hierarchy, colors,
  rounded controls, and product grid; motion should clarify state changes only.
*/
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import GeoBanner from '../components/GeoBanner'
import BrandPlaceholder from '../components/BrandPlaceholder'
import Icon from '../components/Icon'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { qaProducts } from '../lib/qaFixtures'

function ProductSkeleton({ index }) {
  return (
    <div className="bg-surface-bright dark:bg-[#242019] rounded-lg custom-shadow overflow-hidden" aria-hidden="true">
      <div className="h-80 skeleton-shimmer" style={{ '--skeleton-delay': `${index * 60}ms` }} />
      <div className="p-6 space-y-3">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" style={{ '--skeleton-delay': `${index * 60 + 40}ms` }} />
        <div className="h-4 w-1/3 rounded skeleton-shimmer" style={{ '--skeleton-delay': `${index * 60 + 80}ms` }} />
      </div>
    </div>
  )
}

export default function Shop() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadError(false)
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })

      const filter = searchParams.get('filter')
      if (filter === 'new') query = query.limit(12)

      try {
        if (import.meta.env.DEV && searchParams.get('qa') === 'fixtures') {
          setProducts(qaProducts)
          setCategories([...new Set(qaProducts.map((p) => p.category))])
          return
        }

        const { data, error } = await query
        if (error) throw error
        setProducts(data ?? [])
        setCategories([...new Set((data ?? []).map((p) => p.category).filter(Boolean))])
      } catch (error) {
        console.error('Failed to load products', error)
        setProducts([])
        setCategories([])
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchParams])

  const visible =
    activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen page-shell">
      <Header />

      <main className="max-w-container-max mx-auto px-5 md:px-margin-edge py-section-gap">
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
              type="button"
              onClick={() => setActiveCategory('all')}
              aria-pressed={activeCategory === 'all'}
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
                  type="button"
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  aria-pressed={activeCategory === c}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter" role="status" aria-label={t('loading')}>
            {Array.from({ length: 6 }, (_, index) => (
              <ProductSkeleton key={index} index={index} />
            ))}
          </div>
        ) : loadError ? (
          <p className="text-center text-sm text-error py-16">{t('load_error')}</p>
        ) : visible.length === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-6 py-16 text-center">
            <Icon name="inventory_2" size={38} className="text-primary" />
            <p className="font-body-md text-body-md text-on-surface-variant">{t('no_products_yet')}</p>
            <Link to="/custom-design" className="font-label-sm text-label-sm text-primary underline underline-offset-4 motion-press">
              {t('nav_custom')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {visible.map((p, index) => (
              <ProductCard key={p.id} product={p} delay={Math.min(index * 60, 360)} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
