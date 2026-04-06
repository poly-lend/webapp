import { useConnection } from 'wagmi'
import { ConnectButton } from './connectButton'
import { ConnectedAccount } from './connectedAccount'

export default function ConnectWallet() {
  const { isConnected } = useConnection()
  if (isConnected) return <ConnectedAccount />
  return <ConnectButton />
}
