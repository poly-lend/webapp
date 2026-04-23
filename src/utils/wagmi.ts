import { QueryClient } from '@tanstack/react-query'
import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { chainConfig } from '@/chainConfig'

export const chain = chainConfig.chain

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [injected()],
  transports: {
    [chain.id]: http(),
  },
})

export const queryClient = new QueryClient()
