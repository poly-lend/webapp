import { NETWORK } from '@/chainConfig'
import { identify, registerSuperProperties, resetIdentity, track } from '@/utils/analytics'
import { ReactNode, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useConnection } from 'wagmi'

// Sits inside <BrowserRouter> so useLocation works. Hangs off the router tree,
// doesn't wrap anything — renders children unchanged.
export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { address, chain } = useConnection()
  const prevAddressRef = useRef<string | undefined>(undefined)

  // Tag every subsequent event with the network, so PostHog filters work.
  useEffect(() => {
    registerSuperProperties({ network: NETWORK })
  }, [])

  // SPA pageviews — react-router swaps routes without a real navigation.
  useEffect(() => {
    track('$pageview', { $current_url: window.location.href, pathname })
  }, [pathname])

  // Identify on connect, reset on disconnect. `address` comes from wagmi and
  // is a normalised 0x-prefixed hex string; good enough as a distinct id.
  useEffect(() => {
    const prev = prevAddressRef.current
    if (address && address !== prev) {
      identify(address, { chain_id: chain?.id, chain_name: chain?.name })
      track('wallet_connected', { chain_id: chain?.id, chain_name: chain?.name })
    } else if (!address && prev) {
      track('wallet_disconnected')
      resetIdentity()
    }
    prevAddressRef.current = address
  }, [address, chain?.id, chain?.name])

  return <>{children}</>
}
