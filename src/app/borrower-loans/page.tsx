import BorrowerLoansTable from '@/components/borrower/borrowerLoansTable'
import { TableSkeleton } from '@/components/ui/tableSkeleton'
import WalletGuard from '@/components/web3/walletGuard'
import { AllLoanData } from '@/types/polyLend'
import { fetchData } from '@/utils/fetchData'
import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'

export default function BorrowerLoans() {
  const [data, setData] = useState<AllLoanData | null>(null)

  const { address } = useConnection()

  useEffect(() => {
    fetchData({ borrower: address }).then(setData)
  }, [address])

  const handleRefreshData = () => {
    fetchData({ borrower: address }).then(setData)
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-center text-4xl mb-4">Loans</h1>

      <WalletGuard isDataReady={!!data} loadingSkeleton={<TableSkeleton columns={11} rows={4} />}>
        <BorrowerLoansTable
          borrower={address as `0x${string}`}
          data={data as AllLoanData}
          onDataRefresh={handleRefreshData}
        />
      </WalletGuard>
    </div>
  )
}
