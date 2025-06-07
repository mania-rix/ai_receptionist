import { SidebarNav } from '@/components/sidebar-nav'
import type { ReactNode } from 'react'

export default function PortalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#0E0E0E] text-white">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
