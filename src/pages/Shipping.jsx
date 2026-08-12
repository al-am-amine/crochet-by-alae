// Design note: Use a warm, editorial information page with generous whitespace and clear delivery-area cards.
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLanguage } from '../i18n/LanguageContext'

export default function Shipping() {
  const { t } = useLanguage()
  const areas = [
    { title: t('shipping_blida_title'), body: t('shipping_blida_body') },
    { title: t('shipping_algiers_title'), body: t('shipping_algiers_body') },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-container-max mx-auto px-5 md:px-margin-edge py-12 md:py-section-gap">
        <div className="max-w-3xl">
          <p className="font-label-sm text-label-sm text-primary mb-3">Crochet by Alae</p>
          <h1 className="font-display-lg text-display-lg text-on-surface dark:text-white mb-5">{t('shipping_title')}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{t('shipping_intro')}</p>
        </div>
        <section className="mt-10 grid gap-5 md:grid-cols-2" aria-labelledby="shipping-areas">
          <h2 id="shipping-areas" className="sr-only">{t('shipping_areas_title')}</h2>
          {areas.map((area) => (
            <article key={area.title} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 shadow-[0_20px_30px_rgba(212,132,154,0.04)]">
              <h3 className="font-headline-md text-headline-md text-primary mb-3">{area.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{area.body}</p>
            </article>
          ))}
        </section>
        <p className="mt-6 font-body-md text-body-md text-on-surface-variant">{t('shipping_address_note')}</p>
      </main>
      <Footer />
    </div>
  )
}
