import LenderOffersTable from '@/components/lender/lenderOffersTable'
import { Spinner } from '@/components/ui/spinner'
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

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-center text-4xl mb-4">Sent Offers</h1>

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
        <LenderOffersTable
          data={data as AllLoanData}
          userAddress={address as `0x${string}`}
          onDataRefresh={handleRefreshData}
        />
      </WalletGuard>
    </div>
  )
}
