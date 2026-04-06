import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MINIMUM_LOAN_DURATION_SECONDS, polylendAddress, usdcAddress, usdcDecimals } from '@/config'
import { polylendConfig } from '@/contracts/polylend'
import { usdcConfig } from '@/contracts/usdc'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import { toDuration } from '@/utils/convertors'
import { fetchAmountOwed } from '@/utils/fetchAmountOwed'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BaseError } from 'viem'
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from 'wagmi'
import InfoAlert from '../widgets/infoAlert'
import LoadingActionButton from '../widgets/loadingActionButton'

export type RepayDialogProps = {
  loanId: string
  startTime: string
  onDataRefresh: () => void
}

export default function RepayDialog({ loanId, startTime, onDataRefresh }: RepayDialogProps) {
  const [open, setOpen] = useState(false)
  const timestamp = BigInt(Math.floor(Date.now() / 1000))
  const [amount, setAmount] = useState<bigint>(BigInt(0))
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [isApproving, setIsApproving] = useState(false)
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [isRepaying, setIsRepaying] = useState(false)
  const [repayTxHash, setRepayTxHash] = useState<`0x${string}` | undefined>(undefined)

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })
  const { isLoading: isRepayConfirming, isSuccess: isRepayConfirmed } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  })

  const { allowance, isLoading: isAllowanceLoading } = useErc20Allowance(
    open,
    usdcAddress as `0x${string}`,
    polylendAddress as `0x${string}`,
    [isApprovalConfirmed],
  )

  const hasSufficientAllowance = allowance >= amount
  const now = Math.floor(Date.now() / 1000)
  const loanAge = now - Number(startTime)
  const canRepayYet = loanAge >= MINIMUM_LOAN_DURATION_SECONDS
  const timeUntilRepay = MINIMUM_LOAN_DURATION_SECONDS - loanAge
  const repayIsEnabled = !isAllowanceLoading && (isApprovalConfirmed || hasSufficientAllowance) && canRepayYet

  useEffect(() => {
    const getAmountOwed = async () => {
      if (!publicClient || !open) return
      const amount = await fetchAmountOwed({
        publicClient,
        loanId,
        timestamp,
      })
      setAmount(amount)
    }
    getAmountOwed()
  }, [open, publicClient, loanId, timestamp])

  useEffect(() => {
    if (open) {
      setIsApproving(false)
      setApprovalTxHash(undefined)
      setIsRepaying(false)
      setRepayTxHash(undefined)
    }
  }, [open])

  useEffect(() => {
    if (isRepayConfirmed) {
      setOpen(false)
      toast.success('Repayment submitted successfully')
      onDataRefresh()
    }
  }, [isRepayConfirmed])

  const handleApproval = async (amount: bigint) => {
    if (!walletClient || !publicClient) return
    try {
      setIsApproving(true)
      const hash = await walletClient.writeContract({
        address: usdcAddress as `0x${string}`,
        abi: usdcConfig.abi,
        functionName: 'approve',
        args: [polylendAddress, amount],
      })
      setApprovalTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleRepay = async (loanId: string, timestamp: bigint) => {
    if (!walletClient || !publicClient) return
    try {
      setIsRepaying(true)
      const hash = await walletClient.writeContract({
        address: polylendAddress as `0x${string}`,
        abi: polylendConfig.abi,
        functionName: 'repay',
        args: [BigInt(loanId), timestamp],
      })
      setRepayTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
    } finally {
      setIsRepaying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline-primary">Repay</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Repay a Loan</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="amountOwed">Amount Owed</Label>
              <Input id="amountOwed" type="text" value={(Number(amount) / 10 ** usdcDecimals).toFixed(6)} disabled />
            </div>

            {!canRepayYet && (
              <InfoAlert text={`Minimum loan duration not met. You can repay in ${toDuration(timeUntilRepay)}.`} />
            )}
            {canRepayYet && !repayIsEnabled && amount > BigInt(0) && !isAllowanceLoading && (
              <InfoAlert text="You need to approve the contract to spend your tokens before you can repay the loan. Click 'Approve' first, then 'Repay' once the approval is confirmed." />
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline-destructive">Cancel</Button>
            </DialogClose>
            <div className="flex items-center gap-2">
              {!repayIsEnabled && !isAllowanceLoading && (
                <LoadingActionButton
                  onClick={() => handleApproval(amount)}
                  disabled={isApproving || isApprovalConfirming || amount === BigInt(0)}
                  loading={isApproving || isApprovalConfirming}
                >
                  Approve
                </LoadingActionButton>
              )}

              <LoadingActionButton
                onClick={() => handleRepay(loanId, timestamp)}
                disabled={isRepaying || isRepayConfirming || !repayIsEnabled}
                loading={isRepaying || isRepayConfirming}
              >
                Repay
              </LoadingActionButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
