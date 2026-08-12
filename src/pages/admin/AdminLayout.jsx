/*
  Security reminder: the admin shell protects the security log and keeps all
  audit visibility inside the authenticated admin area; no public analytics is added.
*/
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Navigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { useAuth } from '../../lib/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'
import { logAdminAction, logAdminPageAccessAttempt } from '../../lib/adminAudit'

const NAV_ITEMS = [
  { to: '/admin', end: true, icon: 'dashboard', key: 'admin_dashboard' },
  { to: '/admin/products', icon: 'inventory_2', key: 'admin_products' },
  { to: '/admin/orders', icon: 'receipt_long', key: 'admin_orders' },
  { to: '/admin/custom-requests', icon: 'edit_note', key: 'admin_custom_requests' },
  { to: '/admin/customers', icon: 'group', key: 'admin_customers' },
  { to: '/admin/settings', icon: 'settings', key: 'admin_settings' },
  { to: '/admin/security-log', icon: 'security', key: 'admin_security_log' },
]

function SidebarContent({ t, onNavigate }) {
  return (
    <>
      <div className="px-gutter py-margin-edge flex flex-col items-center border-b border-outline-variant/30 mb-unit-4">
        <div className="w-16 h-16 rounded-full bg-secondary-container mb-4 flex items-center justify-center">
          <Icon name="storefront" size={28} className="text-on-secondary-container" />
        </div>
        <h2 className="font-headline-md text-headline-md text-primary mb-1">{t('admin_owner_label')}</h2>
        <p className="font-label-sm text-label-sm text-on-surface-variant">{t('admin_settings')}</p>
      </div>

      <div className="flex flex-col gap-2 flex-grow overflow-y-auto pe-2">
        {NAV_ITEMS.map(({ to, end, icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg font-label-sm text-label-sm transition-all duration-300 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-[4px]'
              }`
            }
          >
            <Icon name={icon} size={20} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-4">
        <NavLink
          to="/admin/products"
          onClick={onNavigate}
          className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Icon name="add" size={18} />
          {t('admin_add_product')}
        </NavLink>
        <button
          onClick={async () => {
            await logAdminAction('admin_logout')
            await supabase.auth.signOut()
          }}
          className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-300 rounded-lg hover:translate-x-[4px]"
        >
          <Icon name="logout" size={20} />
          <span className="font-label-sm text-label-sm">{t('admin_logout')}</span>
        </button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { loading, isAdmin, session } = useAuth()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const accessAuditSent = useRef(false)

  useEffect(() => {
    if (!loading && !isAdmin && !accessAuditSent.current) {
      accessAuditSent.current = true
      logAdminPageAccessAttempt({ email: session?.user?.email || '[unknown]', path: window.location.pathname })
    }
  }, [loading, isAdmin, session])

  if (loading) {
    return <p className="min-h-screen flex items-center justify-center text-sm">{t('loading')}</p>
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="bg-surface dark:bg-[#1A1A1A] text-on-surface dark:text-white min-h-screen">
      <nav className="hidden md:flex fixed end-0 top-0 h-screen w-64 flex-col p-unit-2 border-s border-outline-variant bg-surface-container dark:bg-[#211a17] z-40">
        <SidebarContent t={t} />
      </nav>

      <main className="md:pe-64 min-h-screen flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 bg-surface/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md sticky top-0 z-30 border-b border-outline-variant/30">
          <h1 className="font-headline-md text-headline-md text-primary italic">{t('admin_owner_label')}</h1>
          <button onClick={() => setMobileOpen((v) => !v)} className="text-primary p-2">
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </header>

        {mobileOpen && (
          <div className="md:hidden flex flex-col p-unit-2 bg-surface-container dark:bg-[#211a17] border-b border-outline-variant/30">
            <SidebarContent t={t} onNavigate={() => setMobileOpen(false)} />
          </div>
        )}

        <div className="p-gutter md:p-margin-edge max-w-container-max mx-auto w-full flex-grow flex flex-col gap-section-gap pb-section-gap">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
