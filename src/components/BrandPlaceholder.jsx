/*
  Style reminder: “خيط هادئ” — preserve Crochet by Alae’s soft editorial
  identity while replacing broken external placeholders with a calm, branded
  fallback that never looks like an unfinished demo asset.
*/
import Icon from './Icon'

export default function BrandPlaceholder({ className = '', label = 'Crochet by Alae' }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative isolate flex h-full min-h-24 w-full items-center justify-center overflow-hidden bg-[#f6d8df] text-[#79545d] dark:bg-[#2b201f] dark:text-[#f5d6dc] ${className}`}
    >
      <div className="absolute -start-10 -top-10 h-36 w-36 rounded-full border-[18px] border-[#e8aeba]/60 dark:border-[#8d495d]/40" />
      <div className="absolute -bottom-16 -end-12 h-48 w-48 rounded-full border-[22px] border-[#efc1cc]/80 dark:border-[#6f3948]/45" />
      <div className="absolute inset-5 rounded-[2rem] border border-[#ffffff]/60 dark:border-[#ffffff]/10" />
      <div className="relative z-10 flex flex-col items-center gap-2 px-5 text-center">
        <Icon name="auto_awesome" size={28} className="opacity-75" />
        <span className="font-headline-md text-xl tracking-wide">{label}</span>
        <span className="font-label-sm text-xs uppercase tracking-[0.22em] opacity-70">handmade with care</span>
      </div>
    </div>
  )
}
