import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { polylendAddress } from '@/config'
import { polylendConfig } from '@/contracts/polylend'
import { cn } from '@/lib/utils'
import { AllLoanData, Loan } from '@/types/polyLend'
import { calculateAmountOwed } from '@/utils/calculations'
import { toAPYText, toDuration, toSharesText, toUSDCString } from '@/utils/convertors'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BaseError } from 'viem'
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from 'wagmi'
import TransferDialog from '../dialogs/transferDialog'
import Address from '../widgets/address'
import LoadingActionButton from '../widgets/loadingActionButton'
import Market from '../widgets/market'
import OutcomeBadge from '../widgets/outcomeBadge'

export default function LenderLoansTable({
  lender,
  data,
  onDataRefresh,
}: {
  lender: `0x${string}`
  data: AllLoanData
  borrower?: `0x${string}`
  onDataRefresh: () => void
}) {
  const [dataType, setDataType] = useState<'my' | 'all'>('my')
  let loans = data.loans

  loans = loans.filter((loan: Loan) => loan.borrower !== lender)

  if (dataType === 'my') {
    loans = loans.filter((loan: Loan) => loan.lender === lender)
  } else {
    loans = loans.filter((loan: Loan) => loan.lender !== lender)
  }

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [callingLoanId, setCallingLoanId] = useState<string | null>(null)
  const [isCalling, setIsCalling] = useState(false)
  const [callTxHash, setCallTxHash] = useState<`0x${string}` | undefined>(undefined)
  const { isLoading: isCallConfirming, isSuccess: isCallConfirmed } = useWaitForTransactionReceipt({ hash: callTxHash })

  const [reclaimingLoanId, setReclaimingLoanId] = useState<string | null>(null)
  const [isReclaiming, setIsReclaiming] = useState(false)
  const [reclaimTxHash, setReclaimTxHash] = useState<`0x${string}` | undefined>(undefined)
  const { isLoading: isReclaimConfirming, isSuccess: isReclaimConfirmed } = useWaitForTransactionReceipt({
    hash: reclaimTxHash,
  })

  useEffect(() => {
    if (isCallConfirmed) {
      toast.success('Loan called successfully')
      onDataRefresh()
      setCallingLoanId(null)
      setCallTxHash(undefined)
    }
  }, [isCallConfirmed])

  useEffect(() => {
    if (isReclaimConfirmed) {
      toast.success('Collateral reclaimed successfully')
      onDataRefresh()
      setReclaimingLoanId(null)
      setReclaimTxHash(undefined)
    }
  }, [isReclaimConfirmed])

  const handleCall = async (loanId: string) => {
    if (!walletClient || !publicClient) return
    try {
      setCallingLoanId(loanId)
      setIsCalling(true)
      const hash = await walletClient.writeContract({
        address: polylendAddress as `0x${string}`,
        abi: polylendConfig.abi,
        functionName: 'call',
        args: [BigInt(loanId)],
      })
      setCallTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
      setCallingLoanId(null)
    } finally {
      setIsCalling(false)
    }
  }

  const handleReclaim = async (loanId: string) => {
    if (!walletClient || !publicClient) return
    try {
      setReclaimingLoanId(loanId)
      setIsReclaiming(true)
      const hash = await walletClient.writeContract({
        address: polylendAddress as `0x${string}`,
        abi: polylendConfig.abi,
        functionName: 'reclaim',
        args: [BigInt(loanId), true],
      })
      setReclaimTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
      setReclaimingLoanId(null)
    } finally {
      setIsReclaiming(false)
    }
  }

  return (
    <div>
      <div className="w-full flex justify-center mt-4 mb-2">
        <Tabs defaultValue="my" className="w-fit" onValueChange={(value) => setDataType(value as 'my' | 'all')}>
          <TabsList>
            <TabsTrigger value="my" className="cursor-pointer">
              My Loans
            </TabsTrigger>
            <TabsTrigger value="all" className="cursor-pointer">
              All Loans
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loans.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">Borrower</TableHead>
              <TableHead className="text-center">Market</TableHead>
              <TableHead className="text-center"> Side </TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Collateral</TableHead>
              <TableHead className="text-right">Lent</TableHead>
              <TableHead className="text-right">Owed</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Time Left</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.loanId}>
                <TableCell align="right">
                  <Address address={loan.borrower} />
                </TableCell>
                <TableCell align="center" className="whitespace-normal">
                  <Market marketOutcome={loan.marketOutcome} />
                </TableCell>
                <TableCell align="center">
                  <OutcomeBadge outcome={loan.marketOutcome.outcome} />
                </TableCell>
                <TableCell align="right" className={cn(BigInt(loan.callTime) > 0 ? 'text-red-500' : '')}>
                  {BigInt(loan.callTime) > 0 ? 'Called' : 'Active'}
                </TableCell>
                <TableCell align="right">{toSharesText(loan.collateralAmount)}</TableCell>
                <TableCell align="right">
                  {toUSDCString(Number(loan.marketOutcome.outcomePrice) * Number(loan.collateralAmount))}
                </TableCell>
                <TableCell align="right">{toUSDCString(loan.loanAmount)}</TableCell>
                <TableCell align="right">
                  {toUSDCString(
                    calculateAmountOwed(Number(loan.loanAmount), Number(loan.rate), Number(loan.startTime)),
                  )}
                </TableCell>
                <TableCell align="right">{toDuration(Number(loan.minimumDuration))}</TableCell>
                <TableCell align="right">
                  {BigInt(loan.callTime) > 0
                    ? toDuration(Number(loan.callTime) + 24 * 60 * 60 - Number(Date.now() / 1000))
                    : toDuration(Number(loan.minimumDuration) - (Date.now() / 1000 - Number(loan.startTime)))}
                </TableCell>
                <TableCell align="right">{toAPYText(loan.rate)}</TableCell>
                <TableCell align="center">
                  <div className="flex justify-end gap-2">
                    {dataType === 'my' ? (
                      <>
                        <LoadingActionButton
                          variant="outline-primary"
                          disabled={
                            Number(loan.minimumDuration) - (Date.now() / 1000 - Number(loan.startTime)) >= 0 ||
                            Number(loan.callTime) > 0 ||
                            (callingLoanId === loan.loanId && (isCalling || isCallConfirming))
                          }
                          onClick={() => handleCall(loan.loanId)}
                          loading={callingLoanId === loan.loanId && (isCalling || isCallConfirming)}
                        >
                          Call
                        </LoadingActionButton>
                        <LoadingActionButton
                          variant="outline-primary"
                          disabled={
                            Number(loan.callTime) === 0 ||
                            Number(loan.callTime) + 24 * 60 * 60 > Number(Date.now() / 1000) ||
                            (reclaimingLoanId === loan.loanId && (isReclaiming || isReclaimConfirming))
                          }
                          onClick={() => handleReclaim(loan.loanId)}
                          loading={reclaimingLoanId === loan.loanId && (isReclaiming || isReclaimConfirming)}
                        >
                          Reclaim
                        </LoadingActionButton>
                      </>
                    ) : (
                      <>
                        <TransferDialog loanId={loan.loanId} callTime={loan.callTime} onDataRefresh={onDataRefresh} />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
