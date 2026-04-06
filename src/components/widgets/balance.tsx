import useUSDCBalance from '@/hooks/useUSDCBalance'
import { toUSDCString } from '@/utils/convertors'
import { chain } from '@/utils/wagmi'
import { useConnection } from 'wagmi'

export default function Balance() {
  const { address, chain: currentChain } = useConnection()

  const { balance } = useUSDCBalance(true)

  const isPolygon = currentChain?.id === chain.id

  return address && isPolygon && <div className="mr-4 font-bold">{balance ? toUSDCString(balance) : 0}</div>
}
