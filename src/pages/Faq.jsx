// Design note: Keep answers compact and legible, using the same warm editorial rhythm as the storefront.
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLanguage } from '../i18n/LanguageContext'

export default function Faq() {
  const { t } = useLanguage()
  const questions = [
    [t('faq_q1'), t('faq_a1')],
    [t('faq_q2'), t('faq_a2')],
    [t('faq_q3'), t('faq_a3')],
    [t('faq_q4'), t('faq_a4')],
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-container-max mx-auto px-5 md:px-margin-edge py-12 md:py-section-gap">
        <div className="max-w-3xl">
          <p className="font-label-sm text-label-sm text-primary mb-3">Crochet by Alae</p>
          <h1 className="font-display-lg text-display-lg text-on-surface dark:text-white mb-8">{t('faq_title')}</h1>
          <div className="space-y-4">
            {questions.map(([question, answer]) => (
              <article key={question} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
                <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-2">{question}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
