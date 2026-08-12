/*
  Style reminder: “خيط هادئ” — keep the existing product-card geometry,
  palette, imagery, and icon language; motion is limited to reveal, lift,
  and the existing image scale interaction.
*/
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import Reveal from './Reveal'

export default function ProductCard({ product, lift = false }) {
  const { t, lang } = useLanguage()
  const image = product.images?.[0] || 'https://placehold.co/600x600/f5c6d0/79545d?text=Crochet+by+Alae'

  return (
    <Reveal as="div" className="h-full">
      <Link
        to={`/product/${product.id}`}
        className={`block h-full bg-surface-bright dark:bg-[#242019] rounded-lg custom-shadow hover-shadow motion-lift cursor-pointer overflow-hidden group ${
          lift ? 'lg:-translate-y-8' : ''
        }`}
      >
        <div className="relative h-80 overflow-hidden bg-surface-container-low">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {product.status === 'custom_only' && (
            <div className="absolute top-4 end-4 bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 font-label-sm text-label-sm text-secondary">
              {t('status_custom_only')}
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col gap-2">
          <h3 className="font-headline-md text-body-lg font-semibold text-on-surface dark:text-white">{product.name}</h3>
          <p className="font-label-sm text-label-sm text-primary tracking-widest">
            {product.show_price && product.price
              ? `${product.price.toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US')} ${lang === 'ar' ? 'د.ج' : 'DZD'}`
              : t('price_on_request')}
          </p>
        </div>
      </Link>
    </Reveal>
  )
}
