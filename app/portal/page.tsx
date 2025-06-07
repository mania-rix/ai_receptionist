/* app/portal/page.tsx */
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PortalIndex() {
  const router = useRouter()

  // kick off redirect after first render
  useEffect(() => {
    router.push('/portal/overview')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <p className="opacity-70">Loading&nbsp;dashboard…</p>
    </div>
  )
}
