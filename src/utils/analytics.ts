import posthog from 'posthog-js'

// Thin wrapper so callers don't have to import posthog-js everywhere,
// and so we have a single spot to add test-mode gating / no-op-on-error later.

export function track(event: string, props?: Record<string, unknown>): void {
  try {
    posthog.capture(event, props)
  } catch {
    // swallow; analytics must never break the app
  }
}

export function identify(distinctId: string, props?: Record<string, unknown>): void {
  try {
    posthog.identify(distinctId, props)
  } catch {
    // noop
  }
}

export function resetIdentity(): void {
  try {
    posthog.reset()
  } catch {
    // noop
  }
}

export function registerSuperProperties(props: Record<string, unknown>): void {
  try {
    posthog.register(props)
  } catch {
    // noop
  }
}
