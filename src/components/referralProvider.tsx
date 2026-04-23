import { NETWORK } from '@/chainConfig'
import {
  bindReferral,
  captureRefFromUrl,
  clearPendingReferralCode,
  getPendingReferralCode,
  hasAttemptedBindFor,
  markReferralBoundFor,
} from '@/utils/referral'
import { ReactNode, useEffect } from 'react'
import { useConnection } from 'wagmi'

// Captures ?ref=CODE into localStorage on every page load, then — as soon as
// a wallet is connected — POSTs the binding to the backend and clears the
// pending code. No-op on mainnet (the backend endpoint only exists on
// testnet).
export default function ReferralProvider({ children }: { children: ReactNode }) {
  if (NETWORK !== 'testnet') return <>{children}</>
  return <ReferralTracker>{children}</ReferralTracker>
}

function ReferralTracker({ children }: { children: ReactNode }) {
  const { address } = useConnection()

  useEffect(() => {
    captureRefFromUrl()
  }, [])

  useEffect(() => {
    if (!address) return
    if (hasAttemptedBindFor(address)) return
    const code = getPendingReferralCode()
    if (!code) return
    bindReferral(code, address).finally(() => {
      clearPendingReferralCode()
      markReferralBoundFor(address)
    })
  }, [address])

  return <>{children}</>
}
