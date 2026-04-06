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
import { polylendAddress, usdcAddress } from '@/config'
import { polylendConfig } from '@/contracts/polylend'
import { usdcConfig } from '@/contracts/usdc'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import { calculateMaxTransferRate } from '@/utils/calculations'
import { toAPYText, toSPYWAI } from '@/utils/convertors'
import { fetchAmountOwed } from '@/utils/fetchAmountOwed'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BaseError } from 'viem'
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from 'wagmi'
import InfoAlert from '../widgets/infoAlert'
import LoadingActionButton from '../widgets/loadingActionButton'

export type TransferDialogProps = {
  loanId: string
  callTime: string
  onDataRefresh: () => void
}

export default function TransferDialog({ loanId, callTime, onDataRefresh }: TransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [newRate, setNewRate] = useState<number>(0)
  const [amountAtCall, setAmountAtCall] = useState<bigint>(BigInt(0))

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [isApproving, setIsApproving] = useState(false)
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferTxHash, setTransferTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [inputError, setInputError] = useState<string | undefined>(undefined)

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })
  const { isLoading: isTransferConfirming, isSuccess: isTransferConfirmed } = useWaitForTransactionReceipt({
    hash: transferTxHash,
  })

  const { allowance, isLoading: isAllowanceLoading } = useErc20Allowance(
    open,
    usdcAddress as `0x${string}`,
    polylendAddress as `0x${string}`,
    [isApprovalConfirmed],
  )

  const hasSufficientAllowance = allowance >= amountAtCall
  const transferIsEnabled = !isAllowanceLoading && (isApprovalConfirmed || hasSufficientAllowance)

  useEffect(() => {
    const getAmountOwed = async () => {
      if (!publicClient || !open) return
      const owed = await fetchAmountOwed({
        publicClient,
        loanId,
        timestamp: BigInt(callTime),
      })
      setAmountAtCall(owed)
    }
    getAmountOwed()
  }, [open, publicClient, loanId, callTime])

  useEffect(() => {
    if (open) {
      setIsApproving(false)
      setApprovalTxHash(undefined)
      setIsTransferring(false)
      setTransferTxHash(undefined)
      setNewRate(0)
      setInputError(undefined)
    }
  }, [open])

  useEffect(() => {
    if (isTransferConfirmed && transferTxHash) {
      setOpen(false)
      toast.success('Transfer submitted successfully')
      onDataRefresh()
    }
  }, [isTransferConfirmed, transferTxHash])

  const handleApproval = async () => {
    if (!walletClient || !publicClient) return
    try {
      setIsApproving(true)
      const hash = await walletClient.writeContract({
        address: usdcAddress as `0x${string}`,
        abi: usdcConfig.abi,
        functionName: 'approve',
        args: [polylendAddress, amountAtCall],
      })
      setApprovalTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleTransfer = async () => {
    if (!walletClient || !publicClient) return
    const rateInSPY = toSPYWAI(newRate / 100)
    if (rateInSPY > maxTransferRate) {
      setInputError('Exceeds max rate')
      return
    }
    setInputError(undefined)
    try {
      setIsTransferring(true)
      const hash = await walletClient.writeContract({
        address: polylendAddress as `0x${string}`,
        abi: polylendConfig.abi,
        functionName: 'transfer',
        args: [BigInt(loanId), rateInSPY],
      })
      setTransferTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
    } finally {
      setIsTransferring(false)
    }
  }
  const maxTransferRate = calculateMaxTransferRate(callTime)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline-primary" disabled={Number(callTime) === 0}>
            Transfer
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transfer Loan</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="newRate">New rate (APY)</Label>
              <Input
                id="newRate"
                type="number"
                value={newRate}
                onChange={(e) => {
                  setNewRate(Number(e.target.value))
                  setInputError(undefined)
                }}
                min={0}
                aria-invalid={!!inputError}
              />
              <div className="flex justify-between">
                <p className={`text-sm text-gray-400 font-medium ${inputError ? 'text-red-500' : ''}`}>
                  Current max rate: {toAPYText(maxTransferRate)}
                </p>
                {inputError ? <p className="text-sm text-red-500 font-medium">{inputError}</p> : null}
              </div>
            </div>

            {!transferIsEnabled && !isAllowanceLoading && (
              <InfoAlert text="You need to approve the contract to spend your tokens before you can transfer the loan. Click 'Approve' first, then 'Transfer' once the approval is confirmed." />
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline-destructive">Cancel</Button>
            </DialogClose>
            <div className="flex items-center gap-2">
              {!transferIsEnabled && !isAllowanceLoading && (
                <LoadingActionButton
                  onClick={handleApproval}
                  disabled={isApproving || isApprovalConfirming || amountAtCall === BigInt(0)}
                  loading={isApproving || isApprovalConfirming}
                >
                  Approve
                </LoadingActionButton>
              )}

              <LoadingActionButton
                onClick={handleTransfer}
                disabled={isTransferring || isTransferConfirming || newRate <= 0 || !!inputError || !transferIsEnabled}
                loading={isTransferring || isTransferConfirming}
              >
                Transfer
              </LoadingActionButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
