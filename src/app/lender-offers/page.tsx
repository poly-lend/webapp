import LenderOffersTable from '@/components/lender/lenderOffersTable'
import { TableSkeleton } from '@/components/ui/tableSkeleton'
import WalletGuard from '@/components/web3/walletGuard'
import { AllLoanData } from '@/types/polyLend'
import { fetchData } from '@/utils/fetchData'
import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'

export default function Lend() {
  const { address } = useConnection()

  const [data, setData] = useState<AllLoanData | null>(null)

  useEffect(() => {
    fetchData({}).then(setData)
  }, [])

  const handleRefreshData = () => {
    fetchData({}).then(setData)
  }

  const skeleton = <TableSkeleton columns={9} rows={4} />

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-center text-4xl mb-4">Sent Offers</h1>

      <WalletGuard isDataReady={!!data} loadingSkeleton={skeleton} disconnectedChildren={!data ? skeleton : undefined}>
        <LenderOffersTable
          data={data as AllLoanData}
          userAddress={address as `0x${string}`}
          onDataRefresh={handleRefreshData}
        />
      </WalletGuard>
    </div>
  )
}
