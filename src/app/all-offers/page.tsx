import AllOffersTable from '@/components/lender/allOffersTable'
import { TableSkeleton } from '@/components/ui/tableSkeleton'
import WalletGuard from '@/components/web3/walletGuard'
import { AllLoanData } from '@/types/polyLend'
import { fetchData } from '@/utils/fetchData'
import { useEffect, useState } from 'react'

export default function Lend() {
  const [data, setData] = useState<AllLoanData | null>(null)

  useEffect(() => {
    fetchData({}).then(setData)
  }, [])

  const handleRefreshData = () => {
    fetchData({}).then(setData)
  }

  const skeleton = <TableSkeleton columns={8} rows={5} />

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-center text-4xl mb-4">All Offers</h1>

      <WalletGuard isDataReady={!!data} loadingSkeleton={skeleton} disconnectedChildren={!data ? skeleton : undefined}>
        <AllOffersTable data={data as AllLoanData} />
      </WalletGuard>
    </div>
  )
}
