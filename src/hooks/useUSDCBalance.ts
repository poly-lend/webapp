import { readBalance } from '@/utils/erc20'
import { useCallback, useEffect, useState } from 'react'
import { useConnection, usePublicClient } from 'wagmi'

export default function useErc20Balance(enabled: boolean, extraDeps: any[] = []) {
  const publicClient = usePublicClient()
  const { address } = useConnection()
  const [balance, setBalance] = useState<bigint>(BigInt(0))
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!publicClient || !address) {
      setBalance(BigInt(0))
      return
    }
    if (!enabled) return
    try {
      setIsLoading(true)
      const value = await readBalance(publicClient as any, address as `0x${string}`)
      setBalance(value)
    } catch {
      setBalance(BigInt(0))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, publicClient, address])

  useEffect(() => {
    // Trigger read on mount or when deps change
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, ...extraDeps])

  return { balance, isLoading, refresh }
}
