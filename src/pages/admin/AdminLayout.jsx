/*
  Design reminder: keep the original warm admin shell and subtle motion; nav
  visibility follows role permissions while server policies remain authoritative;
  direction-aware motion must never fight the current reading direction.
*/
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Navigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import AdminControls from '../../components/AdminControls'
import BrandLogo from '../../components/BrandLogo'
import { useAuth } from '../../lib/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { supabase } from '../../lib/supabaseClient'
import { getAdminAttemptContext, logAdminAction, logAdminPageAccessAttempt } from '../../lib/adminAudit'

const NAV_ITEMS = [
  { to: '/admin', end: true, icon: 'dashboard', key: 'admin_dashboard' },
  { to: '/admin/products', icon: 'inventory_2', key: 'admin_products', permission: 'products.view' },
  { to: '/admin/orders', icon: 'receipt_long', key: 'admin_orders', permission: 'orders.view' },
  { to: '/admin/custom-requests', icon: 'edit_note', key: 'admin_custom_requests', permission: 'custom_requests.view' },
  { to: '/admin/customers', icon: 'group', key: 'admin_customers', permission: 'customers.view' },
  { to: '/admin/settings', icon: 'settings', key: 'admin_settings', permission: 'settings.manage' },
  { to: '/admin/security-log', icon: 'security', key: 'admin_security_log', permission: 'security_log.view' },
  { to: '/admin/admin-requests', icon: 'person_add', key: 'admin_access_requests', permission: 'admin_users.manage', ownerOnly: true },
]

function canAccess(permission, permissions, isSuperAdmin) {
  if (!permission || isSuperAdmin) return true
  if (permissions.includes(permission)) return true
  return permission.endsWith('.view') && permissions.includes(permission.replace('.view', '.manage'))
}

function SidebarContent({ t, onNavigate, isSuperAdmin, permissions }) {
  const navItems = NAV_ITEMS.filter(({ permission, ownerOnly }) => (!ownerOnly || isSuperAdmin) && canAccess(permission, permissions, isSuperAdmin))
  const canManageProducts = canAccess('products.manage', permissions, isSuperAdmin)

  return (
    <>
      <div className="px-gutter py-margin-edge flex flex-col items-center border-b border-outline-variant/30 mb-unit-4"><BrandLogo label={t('brand')} imgClassName="h-16 w-16" className="mb-4" /><h2 className="font-headline-md text-headline-md text-primary mb-1">{t('admin_owner_label')}</h2><p className="font-label-sm text-label-sm text-on-surface-variant">{t('admin_settings')}</p></div>
      <div className="flex flex-col gap-2 flex-grow overflow-y-auto pe-2">{navItems.map(({ to, end, icon, key }) => <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 p-3 rounded-lg font-label-sm text-label-sm transition-all duration-300 ${isActive ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high ltr:hover:translate-x-[4px] rtl:hover:-translate-x-[4px]'}`}><Icon name={icon} size={20} /><span>{t(key)}</span></NavLink>)}</div>
      <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-4">{canManageProducts && <NavLink to="/admin/products" onClick={onNavigate} className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"><Icon name="add" size={18} />{t('admin_add_product')}</NavLink>}<button onClick={async () => { await logAdminAction('admin_logout'); await supabase.auth.signOut() }} className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-300 rounded-lg ltr:hover:translate-x-[4px] rtl:hover:-translate-x-[4px]"><Icon name="logout" size={20} /><span className="font-label-sm text-label-sm">{t('admin_logout')}</span></button></div>
    </>
  )
}

export default function AdminLayout() {
  const { loading, isAdmin, isSuperAdmin, permissions, session } = useAuth()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const accessAuditSent = useRef(false)

  useEffect(() => {
    if (!loading && !isAdmin && !accessAuditSent.current) { accessAuditSent.current = true; logAdminPageAccessAttempt({ email: session?.user?.email || '[unknown]', path: window.location.pathname, metadata: getAdminAttemptContext() }) }
  }, [loading, isAdmin, session])

  if (loading) return <p className="min-h-screen flex items-center justify-center text-sm">{t('loading')}</p>
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-surface text-on-surface dark:bg-[#1A1A1A] dark:text-white">
      <nav className="fixed end-0 top-0 z-40 hidden h-screen w-64 flex-col border-s border-outline-variant bg-surface-container p-unit-2 dark:bg-[#211a17] md:flex">
        <SidebarContent t={t} isSuperAdmin={isSuperAdmin} permissions={permissions} />
      </nav>
      <main className="flex min-h-screen flex-col md:pe-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/30 bg-surface/90 p-4 backdrop-blur-md dark:bg-[#1A1A1A]/90 md:hidden">
          <BrandLogo label={t('brand')} imgClassName="h-9 w-9" />
          <div className="flex items-center gap-3">
            <AdminControls />
            <button type="button" onClick={() => setMobileOpen((v) => !v)} className="p-2 text-primary" aria-label={t('admin_menu')}>
              <Icon name={mobileOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </header>
        {mobileOpen && <div className="flex flex-col border-b border-outline-variant/30 bg-surface-container p-unit-2 dark:bg-[#211a17] md:hidden"><SidebarContent t={t} isSuperAdmin={isSuperAdmin} permissions={permissions} onNavigate={() => setMobileOpen(false)} /></div>}
        <div className="hidden items-center justify-end border-b border-outline-variant/30 px-gutter py-3 md:flex"><AdminControls /></div>
        <div className="mx-auto flex w-full max-w-container-max flex-grow flex-col gap-section-gap p-gutter pb-section-gap md:p-margin-edge">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
