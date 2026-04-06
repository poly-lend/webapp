import AllOffersTable from '@/components/lender/allOffersTable'
import { Spinner } from '@/components/ui/spinner'
import WalletGuard from '@/components/web3/walletGuard'
import { AllLoanData } from '@/types/polyLend'
import { fetchData } from '@/utils/fetchData'
import { Suspense, useEffect, useState } from 'react'

export default function Lend() {
  const [data, setData] = useState<AllLoanData | null>(null)

  useEffect(() => {
    fetchData({}).then(setData)
  }, [])

  const handleRefreshData = () => {
    fetchData({}).then(setData)
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-center text-4xl mb-4">All Offers</h1>

      <WalletGuard
        isDataReady={!!data}
        disconnectedChildren={
          !!data ? (
            <div className="flex justify-center py-6"></div>
          ) : (
            <div className="flex justify-center py-6">
              <Spinner className="size-12 text-primary" />
            </div>
          )
        }
      >
        <Suspense fallback={<Spinner className="size-12 text-primary" />}>
          <AllOffersTable data={data as AllLoanData} />
        </Suspense>
      </WalletGuard>
    </div>
  )
}
