'use client'

import { useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, History, Bell, Activity, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/behavior', label: 'Behavior Profile', icon: Activity },
  { href: '/dashboard/sessions', label: 'Sessions', icon: History },
  { href: '/dashboard/alerts', label: 'Security Alerts', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-bold font-mono">ATO Shield</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted">
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.fullName || 'User'}</div>
              <div className="text-xs text-muted truncate">{user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
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
                    ? 'bg-accent/15 text-accent-light font-medium border border-accent/20'
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

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-border">
          <div className="text-xs text-muted text-center">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Behavioral tracking active
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted">
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/admin" className="text-xs text-muted hover:text-accent-light transition-colors border border-border hover:border-accent/40 px-3 py-1.5 rounded-lg">
              Admin Panel →
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
