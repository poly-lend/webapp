import { proxyConfig } from '@/contracts/proxy'
import { useConnection, useReadContract } from 'wagmi'

export default function useProxyAddress() {
  const { address } = useConnection()
  const proxyAddressData = useReadContract({
    ...proxyConfig,
    functionName: 'computeProxyAddress',
    args: [address as `0x${string}`],
  })

  return proxyAddressData
}
