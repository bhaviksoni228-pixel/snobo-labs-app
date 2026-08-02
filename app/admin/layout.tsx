'use client'

import { usePathname, useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Leads', icon: '◧' },
  { href: '/admin/services', label: 'Services', icon: '◆' },
  { href: '/admin/blog', label: 'Blog', icon: '✏' },
  { href: '/admin/content', label: 'Site Content', icon: '✎' },
  { href: '/admin/portfolio', label: 'Portfolio', icon: '◫' },
  { href: '/admin/conversations', label: 'Conversations', icon: '◔' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Login page gets no sidebar — full screen, standalone
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  async function handleLogout() {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-grey-2 h-screen sticky top-0 py-6 px-4">
        <div className="font-display font-bold text-sm tracking-[0.1em] px-3 mb-8">
          SNOBO ADMIN
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white text-black' : 'text-grey-5 hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-base w-4 text-center">{item.icon}</span>
                {item.label}
              </a>
            )
          })}
        </nav>
        <div className="flex flex-col gap-2 pt-4 border-t border-grey-2">
          <a
            href="/"
            target="_blank"
            className="px-3 py-2 text-xs text-grey-4 hover:text-white transition-colors"
          >
            View live site ↗
          </a>
          <button
            onClick={handleLogout}
            className="text-left px-3 py-2 text-xs text-grey-4 hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-grey-2 flex items-center justify-between px-4 h-14">
        <span className="font-display font-bold text-sm tracking-[0.1em]">SNOBO ADMIN</span>
        <button onClick={handleLogout} className="text-xs text-grey-4">
          Log out
        </button>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-grey-2 flex justify-around items-center h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] ${
                isActive ? 'text-white' : 'text-grey-4'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* Main content */}
      <div className="flex-1 min-w-0 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  )
}