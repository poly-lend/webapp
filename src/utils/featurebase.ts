// Minimal wrapper around the Featurebase SDK queue-loader snippet.
// Both init and identify are safe to call before the remote SDK script has
// loaded — they push into a queue that the SDK drains on arrival.
// If VITE_PUBLIC_FEATUREBASE_ORG_ID is unset, everything no-ops so plain
// `npm run build` without the org ID still produces a working bundle.

type FeaturebaseFn = {
  (...args: unknown[]): void
  q?: unknown[]
}

declare global {
  interface Window {
    Featurebase?: FeaturebaseFn
  }
}

const ORG_ID = import.meta.env.VITE_PUBLIC_FEATUREBASE_ORG_ID

function ensureQueue(): FeaturebaseFn {
  if (typeof window.Featurebase !== 'function') {
    const fn: FeaturebaseFn = function (...args: unknown[]) {
      ;(fn.q = fn.q || []).push(args)
    }
    window.Featurebase = fn
  }
  return window.Featurebase
}

function injectSdk() {
  const id = 'featurebase-sdk'
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.src = 'https://do.featurebase.app/js/sdk.js'
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript.parentNode?.insertBefore(script, firstScript)
}

let initialized = false

export function initFeaturebaseWidget(): void {
  if (!ORG_ID || initialized) return
  initialized = true
  ensureQueue()
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    injectSdk()
  } else {
    document.addEventListener('DOMContentLoaded', injectSdk)
  }
  ensureQueue()('initialize_feedback_widget', {
    organization: ORG_ID,
    theme: 'dark',
    placement: 'right',
    defaultBoard: 'ux',
  })
}

export function identifyFeaturebaseUser(userId: string): void {
  if (!ORG_ID) return
  ensureQueue()('identify', {
    organization: ORG_ID,
    userId,
  })
}
