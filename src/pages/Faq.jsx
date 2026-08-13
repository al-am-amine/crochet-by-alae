// Design note: Keep answers compact and legible, using the same warm editorial rhythm as the storefront.
import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { useState } from 'react'

export default function Faq() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState(0)
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
            {questions.map(([question, answer], index) => {
              const isOpen = openIndex === index
              const answerId = `faq-answer-${index}`
              return (
              <article key={question} className="bg-surface-container-low dark:bg-[#242424] rounded-xl border border-outline-variant/30 overflow-hidden transition-colors duration-200">
                <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-4 p-6 text-start motion-press"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{question}</span>
                    <Icon name={isOpen ? 'remove' : 'add'} size={22} className="shrink-0 text-primary" />
                  </button>
                </h2>
                <div id={answerId} hidden={!isOpen} className="px-6 pb-6">
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#d4d4d4] leading-relaxed">{answer}</p>
                </div>
              </article>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
