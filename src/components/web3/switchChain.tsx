import { chain } from '@/utils/wagmi'
import { Button } from '../ui/button'

import { useConnection, useSwitchChain } from 'wagmi'

export default function ConnectChain() {
  const { address, chain: currentChain } = useConnection()
  const { mutate } = useSwitchChain()

  const isPolygon = currentChain?.id === chain.id

  return address && !isPolygon ? (
    <div className="mr-4">
      <Button variant="outline-destructive" onClick={() => mutate({ chainId: chain.id })}>
        Switch Chain
      </Button>
    </div>
  ) : (
    <></>
  )
}
