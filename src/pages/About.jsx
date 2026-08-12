// Style note: preserve Crochet by Alae's original palette, icon language, editorial asymmetry, and restrained “خيط هادئ” motion.
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'

const PLACEHOLDER = 'https://placehold.co/900x800/f5c6d0/79545d?text=Crochet+by+Alae'

export default function About() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col gap-section-gap pb-section-gap">
        {/* Hero */}
        <Reveal as="section" className="w-full max-w-container-max mx-auto px-5 md:px-margin-edge pt-8 md:pt-section-gap">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            <div className="md:col-span-5 md:col-start-8 space-y-6 text-right z-10 md:-mr-12 bg-surface dark:bg-[#242019] p-8 rounded-lg custom-shadow relative">
              <h1 className="font-display-lg text-headline-lg md:text-display-lg text-primary">{t('about_hero_title')}</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">{t('about_hero_body')}</p>
            </div>
            <div className="md:col-span-7 md:col-start-1 md:row-start-1 -mt-12 md:mt-0">
              <img
                src={PLACEHOLDER}
                alt=""
                className="w-full h-[320px] md:h-[600px] object-cover rounded-xl custom-shadow shadow-lg transition-transform hover:-translate-y-2 duration-500"
              />
            </div>
          </div>
        </Reveal>

        <div className="max-w-container-max mx-auto w-full px-5 md:px-margin-edge">
          <div className="stitch-divider opacity-50" />
        </div>

        {/* Section 1 */}
        <Reveal as="section" className="w-full max-w-container-max mx-auto px-5 md:px-margin-edge">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            <div className="md:col-span-6 order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-secondary-container rounded-xl -translate-x-4 translate-y-4 -z-10" />
              <img src={PLACEHOLDER} alt="" className="w-full h-[320px] md:h-[500px] object-cover rounded-xl custom-shadow" />
            </div>
            <div className="md:col-span-5 md:col-start-8 space-y-6 order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full font-label-sm text-label-sm text-primary">
                <Icon name="auto_awesome" size={16} />
                {t('about_badge_1')}
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{t('about_section1_title')}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('about_section1_body')}</p>
            </div>
          </div>
        </Reveal>

        {/* Section 2 */}
        <Reveal as="section" delay={80} className="w-full max-w-container-max mx-auto px-5 md:px-margin-edge">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            <div className="md:col-span-5 md:col-start-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full font-label-sm text-label-sm text-primary">
                <Icon name="location_on" size={16} />
                {t('about_badge_2')}
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{t('about_section2_title')}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('about_section2_body')}</p>
            </div>
            <div className="md:col-span-6 md:col-start-7 relative">
              <div className="absolute inset-0 bg-primary-fixed-dim/30 rounded-xl translate-x-4 -translate-y-4 -z-10" />
              <img src={PLACEHOLDER} alt="" className="w-full h-[320px] md:h-[500px] object-cover rounded-xl custom-shadow" />
            </div>
          </div>
        </Reveal>

        {/* Trust points */}
        <section className="w-full bg-surface-container-low dark:bg-[#211a17] py-20">
          <div className="max-w-container-max mx-auto px-5 md:px-margin-edge">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-center">
              {[
                { icon: 'verified', title: t('about_trust_quality'), desc: t('about_trust_quality_desc') },
                { icon: 'local_shipping', title: t('about_trust_delivery'), desc: t('about_trust_delivery_desc') },
                { icon: 'design_services', title: t('about_trust_custom'), desc: t('about_trust_custom_desc') },
              ].map((item, i) => (
                <Reveal
                  as="div"
                  key={i}
                  delay={i * 80}
                  className="bg-surface dark:bg-[#242019] p-8 rounded-xl custom-shadow flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300"
                >
                  <Icon name={item.icon} size={36} className="text-primary p-4 bg-primary-fixed rounded-full" />
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{item.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{item.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <Reveal as="section" delay={120} className="w-full max-w-container-max mx-auto px-5 md:px-margin-edge text-center py-10">
          <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white mb-8">
            {t('about_final_cta_title')}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/shop"
              className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-4 rounded-lg hover:bg-primary-container hover:shadow-lg transition-all duration-300 motion-press"
            >
              {t('about_cta_shop')}
            </Link>
            <Link
              to="/custom-design"
              className="border border-primary text-primary font-label-sm text-label-sm px-8 py-4 rounded-lg hover:bg-secondary-container transition-all duration-300 motion-press"
            >
              {t('about_cta_custom')}
            </Link>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  )
}
