import { EnhancedSidebar } from '@/components/ui/enhanced-sidebar';
import { NotificationDrawer } from '@/components/ui/notification-drawer';
import type { ReactNode } from 'react'

export default function PortalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#0E0E0E] text-white">
      <EnhancedSidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="h-16 border-b border-gray-800 bg-[#121212] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">BlvckWall AI Platform</h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDrawer />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
