"use client"

import { useEffect } from "react"
import LogRocket from "logrocket"

let hasInitialized = false

export function LogRocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID?.trim()

    if (!appId || hasInitialized) return

    LogRocket.init(appId)
    hasInitialized = true
  }, [])

  return <>{children}</>
}

