/* Style reminder: “خيط هادئ” — preserve the original header hierarchy, colors,
   icons, and spacing; motion only clarifies state changes and stays restrained. */
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useLanguage } from '../i18n/LanguageContext'
import { useTheme } from '../lib/ThemeContext'
import { useCart } from '../lib/CartContext'
import { useAuth } from '../lib/AuthContext'
import BrandLogo from './BrandLogo'

const NAV_LINKS = [
  { to: '/', key: 'nav_home' },
  { to: '/shop', key: 'nav_shop_all' },
  { to: '/custom-design', key: 'nav_custom' },
  { to: '/about', key: 'nav_about' },
]

export default function Header() {
  const { t, lang, toggleLang } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { items } = useCart()
  const { isAdmin, loading: authLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex flex-row-reverse justify-between items-center px-5 md:px-margin-edge h-20 bg-surface/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md transition-shadow ${
        scrolled ? 'shadow-[0_30px_30px_rgba(212,132,154,0.08)]' : ''
      }`}
    >
      <div className="flex items-center gap-gutter">
        <Link to="/" aria-label={t('brand')} className="transition-transform duration-200 hover:scale-[1.03]">
          <BrandLogo label={t('brand')} imgClassName="h-11 w-11 md:h-12 md:w-12" />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-gutter">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `font-label-sm text-label-sm transition-colors duration-300 pb-1 ${
                isActive
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            {t(link.key)}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-unit">
        <button
          onClick={toggleLang}
          className="text-primary font-label-sm text-label-sm cursor-pointer hover:opacity-70 transition-opacity motion-press"
        >
          {lang === 'ar' ? 'EN' : 'AR'}
        </button>
        <Link to="/cart" className="relative">
          <Icon name="shopping_basket" className="text-primary cursor-pointer hover:opacity-70 transition-opacity motion-press" />
          {items.length > 0 && (
            <span className="absolute -top-1.5 -end-1.5 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Link>
        {!authLoading && isAdmin && <Link to="/admin" aria-label={t('admin_open_dashboard')} title={t('admin_open_dashboard')} className="text-primary transition hover:opacity-70 motion-press"><Icon name="admin_panel_settings" /></Link>}
        <button onClick={toggleTheme} aria-label="toggle theme" className="motion-press">
          <Icon
            name={theme === 'light' ? 'dark_mode' : 'light_mode'}
            className="text-primary cursor-pointer hover:opacity-70 transition-opacity"
          />
        </button>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden motion-press"
          aria-label="menu"
        >
          <Icon name={menuOpen ? 'close' : 'menu'} className="text-primary" />
        </button>
      </div>

      <div
        className={`md:hidden absolute top-20 inset-x-0 bg-surface dark:bg-[#1A1A1A] border-t border-outline-variant/30 flex flex-col items-center gap-5 py-6 shadow-lg mobile-menu ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-label-sm text-label-sm ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
      </div>
    </nav>
  )
}
