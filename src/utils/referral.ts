const API_BASE = 'https://api-testnet.polylend.com/testnet/referral'
const PENDING_KEY = 'polylend:pendingReferralCode'
const BOUND_KEY = 'polylend:referralBoundFor'

export async function fetchReferralCode(address: `0x${string}`): Promise<string> {
  const response = await fetch(`${API_BASE}/${address}`)
  if (!response.ok) throw new Error(`Failed to fetch referral code: ${response.statusText}`)
  const data = await response.json()
  return data.code
}

export type BindOutcome = 'ok' | 'self_referral' | 'already_bound' | 'unknown_code' | 'error'

export async function bindReferral(code: string, referred: `0x${string}`): Promise<BindOutcome> {
  try {
    const response = await fetch(`${API_BASE}/bind`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, referred }),
    })
    if (response.ok) return 'ok'
    const data = await response.json().catch(() => ({}))
    const reason = data?.reason as BindOutcome | undefined
    return reason === 'self_referral' || reason === 'already_bound' || reason === 'unknown_code'
      ? reason
      : 'error'
  } catch {
    return 'error'
  }
}

// Read ?ref=CODE off the URL and stash it. Strip from the URL so a subsequent
// share doesn't propagate the code further.
export function captureRefFromUrl(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (!ref) return
  try {
    window.localStorage.setItem(PENDING_KEY, ref)
  } catch {}
  params.delete('ref')
  const query = params.toString()
  const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash
  window.history.replaceState({}, '', url)
}

export function getPendingReferralCode(): string | null {
  try {
    return window.localStorage.getItem(PENDING_KEY)
  } catch {
    return null
  }
}

export function clearPendingReferralCode(): void {
  try {
    window.localStorage.removeItem(PENDING_KEY)
  } catch {}
}

export function markReferralBoundFor(address: `0x${string}`): void {
  try {
    window.localStorage.setItem(BOUND_KEY, address.toLowerCase())
  } catch {}
}

export function hasAttemptedBindFor(address: `0x${string}`): boolean {
  try {
    return window.localStorage.getItem(BOUND_KEY) === address.toLowerCase()
  } catch {
    return false
  }
}
