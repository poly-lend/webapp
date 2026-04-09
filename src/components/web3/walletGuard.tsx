
import ClientOnly from '@/utils/clientOnly'
import { chain } from '@/utils/wagmi'
import { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import ConnectWidget from './connectWidget'
import SwitchWidget from './switchWidget'

type WalletGuardProps = {
  children: ReactNode
  isDataReady?: boolean
  disconnectedChildren?: ReactNode
  loadingSkeleton?: ReactNode
}

export default function WalletGuard({
  children,
  isDataReady = true,
  disconnectedChildren,
  loadingSkeleton,
}: WalletGuardProps) {
  const { status, address, chain: currentChain } = useConnection()

  const isPolygon = currentChain?.id === chain.id
  const isWalletLoading = status === 'connecting' || status === 'reconnecting'

  const showConnect = status === 'disconnected'
  const showSwitch = status === 'connected' && !isPolygon && address
  const showLoading = isWalletLoading || (!isDataReady && !showConnect && !showSwitch)
  const showChildren = isDataReady && !showConnect && !showSwitch && !showLoading

  return (
    <ClientOnly>
      {showConnect && (
        <div className="h-40 flex justify-center">
          <ConnectWidget />
        </div>
      )}
      {showSwitch && (
        <div className="h-40 flex justify-center">
          <SwitchWidget />
        </div>
      )}
      {showLoading && <>{loadingSkeleton}</>}
      {showChildren && <>{children}</>}
      {!showChildren && disconnectedChildren && !showLoading && <>{disconnectedChildren}</>}
    </ClientOnly>
  )
}
