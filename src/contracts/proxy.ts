import { proxyAddress } from '@/config'

export const proxyConfig = {
  address: proxyAddress,
  abi: [
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'computeProxyAddress',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
} as const
