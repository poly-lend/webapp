import { readAllowance } from '@/utils/erc20'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, usePublicClient } from 'wagmi'

export default function useErc20Allowance(
  enabled: boolean,
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
  extraDeps: any[] = [],
) {
  const publicClient = usePublicClient()
  const { address } = useConnection()
  const [allowance, setAllowance] = useState<bigint>(BigInt(0))
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!publicClient || !address) {
      setAllowance(BigInt(0))
      return
    }
    if (!enabled) return
    try {
      setIsLoading(true)
      const value = await readAllowance(publicClient as any, tokenAddress, address as `0x${string}`, spender)
      setAllowance(value)
    } catch {
      setAllowance(BigInt(0))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, publicClient, address, tokenAddress, spender])

  useEffect(() => {
    // Trigger read on mount or when deps change
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, ...extraDeps])

  return { allowance, isLoading, refresh }
}
