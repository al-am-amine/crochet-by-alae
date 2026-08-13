/*
  Design reminder: the public storefront stays unchanged; this context keeps
  admin access state calm and explicit while respecting the original styling.
*/
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { getCurrentAdminAccess } from './adminAudit'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [access, setAccess] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadAccess(nextSession) {
    setSession(nextSession)
    if (!nextSession?.user?.email) {
      setAccess(null)
      setLoading(false)
      return
    }
    const { data, error } = await getCurrentAdminAccess()
    setAccess(error ? null : data)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => loadAccess(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      window.setTimeout(() => void loadAccess(newSession), 0)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const role = access?.role || null
  const permissions = Array.isArray(access?.permissions) ? access.permissions : []
  const isActive = access?.is_active === true
  const isAdmin = isActive && (role === 'admin' || role === 'super_admin')
  const isSuperAdmin = isActive && role === 'super_admin'

  function hasPermission(permission) {
    return isSuperAdmin || permissions.includes(permission)
  }

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      access,
      role,
      permissions,
      isAdmin,
      isSuperAdmin,
      hasPermission,
      adminEmail: session?.user?.email || '',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
