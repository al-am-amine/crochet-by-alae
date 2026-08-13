/*
  Style reminder: “خيط هادئ” — preserve the original asymmetric composition,
  palette, icons, and typography; only add low-amplitude reveal and press motion.
*/
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import GeoBanner from '../components/GeoBanner'
import Icon from '../components/Icon'
import BrandPlaceholder from '../components/BrandPlaceholder'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const { t, lang } = useLanguage()
  const [products, setProducts] = useState([])

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setProducts(data ?? []))
  }, [])

  const priceLabel = (p) =>
    p?.show_price && p?.price
      ? `${p.price.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')} ${lang === 'ar' ? 'د.ج' : 'DZD'}`
      : t('price_on_request')

  return (
    <div className="min-h-screen page-shell">
      <Header />
      <div className="px-5 md:px-margin-edge mt-4">
        <GeoBanner />
      </div>

      <main className="w-full max-w-container-max mx-auto">
        {/* Hero */}
        <section className="relative min-h-[500px] md:min-h-[819px] flex items-center px-5 md:px-margin-edge py-16 md:py-section-gap">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter w-full items-center">
            <Reveal
              as="div"
              className="md:col-span-6 md:col-start-7 space-y-6 z-10 text-center md:text-right md:pr-gutter"
            >
              <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface dark:text-white leading-tight whitespace-pre-line">
                {t('hero_title')}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto md:mx-0">
                {t('hero_subtitle')}
              </p>
              <Link
                to="/shop"
                className="inline-block bg-primary text-on-primary font-label-sm text-label-sm px-8 py-3 rounded-lg hover:bg-surface-tint transition-colors shadow-[0_10px_20px_rgba(212,132,154,0.2)] motion-press"
              >
                {t('hero_cta')}
              </Link>
            </Reveal>
            <Reveal as="div" delay={80} className="md:col-span-6 md:col-start-1 relative mt-12 md:mt-0">
              <div className="absolute inset-0 bg-secondary-container rounded-full blur-[80px] opacity-40 transform translate-x-1/4 -translate-y-1/4 z-0" />
              <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-[0_30px_30px_rgba(212,132,154,0.08)] transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <BrandPlaceholder className="h-[320px] md:h-[600px] hero-visual-drift" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Feature row */}
        <section className="px-5 md:px-margin-edge py-12 bg-surface-container-low dark:bg-[#211a17]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-center">
            {[
              { icon: 'volunteer_activism', title: t('feature_handmade'), desc: t('feature_handmade_desc') },
              { icon: 'local_shipping', title: t('feature_delivery'), desc: t('feature_delivery_desc') },
              { icon: 'palette', title: t('feature_customizable'), desc: t('feature_customizable_desc') },
            ].map((f, i) => (
              <Reveal key={i} as="div" delay={i * 80} className="flex flex-col items-center gap-4 relative">
                {i === 1 && (
                  <div className="hidden md:block absolute inset-x-0 top-1/2 h-px bg-outline-variant -z-10" />
                )}
                <Icon name={f.icon} filled size={36} className="text-primary" />
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{f.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="w-full stitch-divider my-12 opacity-50" />

        {/* Featured products — asymmetric triptych */}
        <section className="px-5 md:px-margin-edge py-section-gap">
          <Reveal as="h2" className="font-headline-lg text-headline-lg text-center mb-16">
            {t('featured_title')}
          </Reveal>

          {products.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-6 py-12 text-center">
              <Icon name="inventory_2" size={34} className="text-primary" />
              <p className="font-body-md text-body-md text-on-surface-variant">{t('no_products_yet')}</p>
              <Link to="/custom-design" className="font-label-sm text-label-sm text-primary underline underline-offset-4 motion-press">
                {t('nav_custom')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter md:auto-rows-[300px]">
              {products[0] && (
                <Reveal
                  as="div"
                  className="md:col-span-7 md:row-span-2 h-72 md:h-auto"
                >
                  <Link
                    to={`/product/${products[0].id}`}
                    className="block h-full group relative overflow-hidden rounded-xl shadow-[0_30px_30px_rgba(212,132,154,0.04)] bg-surface cursor-pointer motion-lift"
                  >
                    {products[0].images?.[0] ? (
                      <img src={products[0].images[0]} alt={products[0].name || t('brand')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : <BrandPlaceholder />}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-surface/90 to-transparent p-6 pt-20">
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{products[0].name}</h3>
                      <p className="font-label-sm text-label-sm text-primary tracking-widest">{priceLabel(products[0])}</p>
                    </div>
                  </Link>
                </Reveal>
              )}

              {products[1] && (
                <Reveal as="div" delay={80} className="md:col-span-5 md:row-span-1 h-56 md:h-auto">
                  <Link
                    to={`/product/${products[1].id}`}
                    className="block h-full group relative overflow-hidden rounded-xl shadow-[0_30px_30px_rgba(212,132,154,0.04)] bg-surface-container-low cursor-pointer hover:-translate-y-1 transition-transform motion-lift"
                  >
                    {products[1].images?.[0] ? (
                      <img src={products[1].images[0]} alt={products[1].name || t('brand')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : <BrandPlaceholder />}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-surface-container-low/90 to-transparent p-4 pt-12">
                      <h3 className="font-headline-md text-on-surface text-xl">{products[1].name}</h3>
                      <p className="font-label-sm text-label-sm text-primary tracking-widest">{priceLabel(products[1])}</p>
                    </div>
                  </Link>
                </Reveal>
              )}

              {products[2] && (
                <Reveal as="div" delay={160} className="md:col-span-5 md:row-span-1 h-56 md:h-auto">
                  <Link
                    to={`/product/${products[2].id}`}
                    className="block h-full group relative overflow-hidden rounded-xl shadow-[0_30px_30px_rgba(212,132,154,0.04)] bg-surface cursor-pointer transform md:translate-y-8 hover:-translate-y-1 transition-transform motion-lift"
                  >
                    {products[2].images?.[0] ? (
                      <img src={products[2].images[0]} alt={products[2].name || t('brand')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : <BrandPlaceholder />}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-surface/90 to-transparent p-4 pt-12">
                      <h3 className="font-headline-md text-on-surface text-xl">{products[2].name}</h3>
                      <p className="font-label-sm text-label-sm text-primary tracking-widest">{priceLabel(products[2])}</p>
                    </div>
                  </Link>
                </Reveal>
              )}
            </div>
          )}
        </section>

        {/* About brand snippet */}
        <Reveal
          as="section"
          className="px-5 md:px-margin-edge py-16 md:py-section-gap bg-secondary-container/20 rounded-3xl mx-5 md:mx-margin-edge my-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square rounded-2xl overflow-hidden border-8 border-surface shadow-xl transform rotate-3">
                <BrandPlaceholder />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{t('about_snippet_title')}</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{t('about_snippet_body')}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('about_snippet_body2')}</p>
              <Link
                to="/about"
                className="inline-block mt-4 border border-primary text-primary font-label-sm text-label-sm px-6 py-2 rounded-lg hover:bg-secondary-container transition-colors motion-press"
              >
                {t('about_read_more')}
              </Link>
            </div>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  )
}
