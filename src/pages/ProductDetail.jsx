/*
  Style reminder: “خيط هادئ” — preserve the original editorial product detail,
  palette, spacing, and image treatment; motion should clarify state only.
*/
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import BrandPlaceholder from '../components/BrandPlaceholder'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../lib/CartContext'
import { qaProducts } from '../lib/qaFixtures'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const { addItem } = useCart()
  const [searchParams] = useSearchParams()
  const qaMode = import.meta.env.DEV && searchParams.get('qa') === 'fixtures'

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [notes, setNotes] = useState('')
  const [justAdded, setJustAdded] = useState(false)
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setActiveImage(0)
    setJustAdded(false)
    setImageBroken(false)

    async function loadProduct() {
      if (qaMode) {
        const fixture = qaProducts.find((item) => item.id === id) || null
        if (!cancelled) {
          setProduct(fixture)
          setColor(fixture?.colors?.[0] || '')
          setSize(fixture?.sizes?.[0] || '')
          setLoading(false)
        }
        return
      }

      const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
      if (!cancelled) {
        setProduct(error ? null : data)
        setColor(data?.colors?.[0] || '')
        setSize(data?.sizes?.[0] || '')
        setLoading(false)
      }
    }

    loadProduct()
    return () => {
      cancelled = true
    }
  }, [id, qaMode])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <p className="flex-1 flex items-center justify-center text-sm text-on-surface-variant">{t('loading')}</p>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-5 py-20 md:px-margin-edge" aria-live="polite">
          <div className="flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-6 py-16 text-center shadow-sm">
            <Icon name="inventory_2" size={42} className="text-primary" />
            <h1 className="font-display-md text-headline-md text-on-surface dark:text-white">
              {t('product_not_found')}
            </h1>
            <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
              {t('product_not_found_description')}
            </p>
            <Link
              to="/shop"
              className="motion-press inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-label-sm text-label-sm text-on-primary shadow-sm transition-colors hover:bg-primary/90"
            >
              <Icon name="shopping_bag" size={18} />
              {t('browse_shop')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const images = product.images?.length ? product.images : []

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      showPrice: product.show_price,
      color,
      size,
      notes,
      image: images[0],
    })
    setJustAdded(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-container-max mx-auto px-5 md:px-margin-edge py-12 md:py-24">
        <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-8">
          <Link to="/shop" className="hover:text-primary transition-colors">{t('nav_shop_all')}</Link>
          <Icon name="chevron_left" size={16} />
          <span className="text-primary font-bold">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          {/* Gallery */}
          <div className="w-full lg:w-3/5 flex flex-col gap-4 order-1">
            <div className="w-full aspect-[4/5] rounded-xl overflow-hidden shadow-[0_30px_30px_rgba(212,132,154,0.04)] bg-surface-container-low group cursor-zoom-in relative">
                {images[activeImage] && !imageBroken ? (
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    onError={() => setImageBroken(true)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : <BrandPlaceholder label={product.name} />}
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 snap-start transition-colors ${
                      i === activeImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100 hover:border-outline-variant'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full lg:w-2/5 flex flex-col order-2 lg:sticky lg:top-28 self-start">
            <div className="mb-8">
              <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white mb-2 leading-tight">
                {product.name}
              </h1>
              <p className="font-label-sm text-label-sm text-primary tracking-widest mt-4">
                {product.show_price && product.price
                  ? `${product.price.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')} ${lang === 'ar' ? 'د.ج' : 'DZD'}`
                  : t('price_on_request')}
              </p>
            </div>

            <div className="stitch-divider my-6" />

            <div className="flex flex-col gap-8">
              {product.colors?.length > 0 && (
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-4">{t('color_label')}</h3>
                  <div className="flex gap-4">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        title={c}
                        className={`w-10 h-10 rounded-full shadow-sm transition-all bg-primary-container ${
                          color === c ? 'ring-2 ring-offset-4 ring-offset-background ring-primary' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-4">{t('size_label')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-6 py-3 rounded-full border font-label-sm text-label-sm transition-all ${
                          size === s
                            ? 'bg-primary-container text-on-primary-container border-primary-container'
                            : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-4">
                  {t('notes_label')}
                </label>
                <div className="relative">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notes_placeholder')}
                    rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 font-body-md text-on-surface dark:text-white placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none shadow-inner"
                  />
                  <Icon name="edit" size={18} className="absolute top-4 start-4 text-outline opacity-50" />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                {!justAdded ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#D4849A] hover:bg-[#8D495D] text-white font-label-sm text-label-sm py-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(212,132,154,0.25)] hover:shadow-[0_6px_20px_rgba(212,132,154,0.4)] transition-all hover:-translate-y-0.5"
                  >
                    <Icon name="shopping_bag" size={20} />
                    {t('add_to_cart')}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-sm text-label-sm py-4 rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(212,132,154,0.25)] transition-all hover:-translate-y-0.5"
                  >
                    <Icon name="shopping_basket" size={20} />
                    {t('go_to_cart')}
                  </button>
                )}
                <div className="flex items-center justify-center gap-2 text-on-surface-variant font-body-md text-sm mt-2">
                  <Icon name="local_shipping" size={16} />
                  <span>{t('feature_delivery')}</span>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="mt-12 pt-8 border-t border-outline-variant">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-6">
                  {t('admin_product_desc')}
                </h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
