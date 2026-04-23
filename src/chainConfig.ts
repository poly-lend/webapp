import type { Chain } from 'wagmi/chains'
import { polygon } from 'wagmi/chains'

export type Network = 'mainnet' | 'testnet'

const rawNetwork = import.meta.env.VITE_NETWORK ?? 'mainnet'
if (rawNetwork !== 'mainnet' && rawNetwork !== 'testnet') {
  throw new Error(`VITE_NETWORK must be "mainnet" or "testnet", got "${rawNetwork}"`)
}
export const NETWORK: Network = rawNetwork

type ChainConfig = {
  chain: Chain
  usdcAddress: `0x${string}`
  usdcDecimals: number
  polylendAddress: `0x${string}`
  polylendDecimals: number
  polymarketSharesDecimals: number
  proxyAddress: `0x${string}`
  polymarketTokensAddress: `0x${string}`
}

const polylendTestnet: Chain = {
  id: 31337,
  name: 'PolyLend Testnet',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.polylend.com'] },
  },
  testnet: true,
}

// Testnet PolyLend is the only address that changes per deploy; everything
// else on the testnet (pfUSDC, ConditionalTokens, SafeProxyFactory) carries
// over from the Polygon fork and is therefore stable.
// The infra-side deploy pipeline passes the freshly-deployed address via a
// --build-arg → ARG → process.env chain; we fall back to the last known
// address if the arg is unset so a plain `docker build` without the pipeline
// still produces a working testnet bundle.
const TESTNET_POLYLEND_FALLBACK = '0xb3EF97d369a6a1Ca69f525916557d58653A07bE8'
const testnetPolylendEnv = import.meta.env.VITE_TESTNET_POLYLEND_ADDRESS
const testnetPolylendAddress: `0x${string}` =
  testnetPolylendEnv && testnetPolylendEnv.startsWith('0x')
    ? (testnetPolylendEnv as `0x${string}`)
    : TESTNET_POLYLEND_FALLBACK

// Inline ternary (not a Record lookup) so the unused branch is dead-code
// eliminated and the bundle only carries the selected network's addresses.
export const chainConfig: ChainConfig =
  NETWORK === 'mainnet'
    ? {
        chain: polygon,
        usdcAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        usdcDecimals: 6,
        polylendAddress: '0x1620A7d943B0DeAf1c2123BE6413F87B5dacEf2b',
        polylendDecimals: 18,
        polymarketSharesDecimals: 6,
        proxyAddress: '0xaacFeEa03eb1561C4e67d661e40682Bd20E3541b',
        polymarketTokensAddress: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
      }
    : {
        chain: polylendTestnet,
        usdcAddress: '0xf6b4Ae31f5C74191E920291c68e9769c4a46D3E4',
        usdcDecimals: 6,
        polylendAddress: testnetPolylendAddress,
        polylendDecimals: 18,
        polymarketSharesDecimals: 6,
        proxyAddress: '0xaacFeEa03eb1561C4e67d661e40682Bd20E3541b',
        polymarketTokensAddress: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
      }
