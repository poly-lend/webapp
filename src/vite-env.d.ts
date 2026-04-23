/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK?: 'mainnet' | 'testnet'
  readonly VITE_TESTNET_POLYLEND_ADDRESS?: string
  readonly VITE_PUBLIC_POSTHOG_PROJECT_TOKEN?: string
  readonly VITE_PUBLIC_POSTHOG_HOST?: string
  readonly VITE_PUBLIC_FEATUREBASE_ORG_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
