'use client'

import { useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, Users, FileText, AlertTriangle, Activity, BarChart2, Menu, X, ChevronRight, Download } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'All Users', icon: Users },
  { href: '/admin/logs', label: 'Session Logs', icon: FileText },
  { href: '/admin/threats', label: 'Threat Feed', icon: AlertTriangle },
  { href: '/admin/biometrics', label: 'Biometrics', icon: Activity },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-red-900/30 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo — admin variant */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-red-900/30">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <span className="font-bold font-mono text-sm">ATO Shield</span>
            <div className="text-xs text-red-400">Admin Panel</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Admin user */}
        <div className="px-4 py-4 border-b border-red-900/20">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</div>
              <div className="text-xs text-red-400">Administrator</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  active
                    ? 'bg-red-900/20 text-red-400 font-medium border border-red-800/40'
                    : 'text-muted hover:text-white hover:bg-subtle'
                )}
              >
                <item.icon size={16} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-red-900/20">
          <Link href="/dashboard" className="text-xs text-muted hover:text-white flex items-center gap-2 transition-colors">
            ← Back to User Dashboard
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-red-900/20 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs bg-red-900/30 text-red-400 border border-red-800/40 px-2 py-1 rounded">
              ADMIN ACCESS
            </span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
