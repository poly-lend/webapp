import { truncateAddress } from '@/utils/convertors'
import { LogOut } from 'lucide-react'
import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { Button } from '../ui/button'

export function ConnectedAccount() {
  const { address } = useConnection()
  const { mutate } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div className="flex items-center gap-2">
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && (
        <div>
          {ensName
            ? `${ensName} (${truncateAddress(address as `0x${string}`)})`
            : truncateAddress(address as `0x${string}`)}
        </div>
      )}

      <Button onClick={() => mutate()}>
        <LogOut className="size-5 stroke-[2.5px]" />
      </Button>
    </div>
  )
}
