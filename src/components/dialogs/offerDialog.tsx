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
import { MINIMUM_LOAN_DURATION_SECONDS, polylendAddress, polymarketSharesDecimals, usdcAddress, usdcDecimals } from '@/config'
import { polylendConfig } from '@/contracts/polylend'
import { usdcConfig } from '@/contracts/usdc'
import useErc20Allowance from '@/hooks/useErc20Allowance'
import { toSPYWAI } from '@/utils/convertors'

import { MarketOutcome } from '@/types/polyLend'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BaseError } from 'viem'
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from 'wagmi'
import { Checkbox } from '../ui/checkbox'
import InfoAlert from '../widgets/infoAlert'
import LoadingActionButton from '../widgets/loadingActionButton'

export default function OfferDialog({
  marketOutcomeIds,
  marketOutcomes,
  onSuccess,
}: {
  marketOutcomeIds: string[]
  marketOutcomes: Map<string, MarketOutcome>
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loanAmount, setLoanAmount] = useState(1000)
  const [collateralValue, setCollateralValue] = useState(2000)
  const [minimumLoanAmount, setMinimumLoanAmount] = useState(1000)
  const [duration, setDuration] = useState(30)
  const [perpetual, setPerpetual] = useState(true)
  const [rate, setRate] = useState(20)
  const [isApproving, setIsApproving] = useState(false)
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>(undefined)
  const [isOffering, setIsOffering] = useState(false)
  const [offerTxHash, setOfferTxHash] = useState<`0x${string}` | undefined>(undefined)

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })

  const { isLoading: isOfferConfirming, isSuccess: isOfferConfirmed } = useWaitForTransactionReceipt({
    hash: offerTxHash,
  })

  useEffect(() => {
    if (open) {
      setIsApproving(false)
      setApprovalTxHash(undefined)
      setIsOffering(false)
      setOfferTxHash(undefined)
      setLoanAmount(1000)
      setCollateralValue(2000)
      setMinimumLoanAmount(100)
      setDuration(30)
      setPerpetual(true)
      setRate(20)
    }
  }, [open])

  useEffect(() => {
    if (isOfferConfirmed && offerTxHash) {
      setOpen(false)
      toast.success('Offer submitted successfully')
      onSuccess()
    }
  }, [isOfferConfirmed, offerTxHash])

  const handleApproval = async () => {
    if (!publicClient || !walletClient) return
    try {
      setIsApproving(true)
      const hash = await walletClient.writeContract({
        address: usdcAddress as `0x${string}`,
        abi: usdcConfig.abi,
        functionName: 'approve',
        args: [polylendAddress, BigInt(loanAmount * 10 ** usdcDecimals)],
      })
      setApprovalTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
    } finally {
      setIsApproving(false)
    }
  }

  const handleOffer = async () => {
    if (!publicClient || !walletClient) return
    const rateInSPY = toSPYWAI(rate / 100)
    try {
      setIsOffering(true)

      const collateralValueInUSDC = collateralValue * 10 ** usdcDecimals
      const collateralAmounts = marketOutcomeIds.map((id) => {
        const marketOutcome = marketOutcomes.get(id)!
        const outcomePrice = marketOutcome.outcomePrice * 10 ** usdcDecimals

        return (BigInt(collateralValueInUSDC) * BigInt(10 ** polymarketSharesDecimals)) / BigInt(outcomePrice)
      })
      const hash = await walletClient.writeContract({
        address: polylendAddress as `0x${string}`,
        abi: polylendConfig.abi,
        functionName: 'offer',
        args: [
          BigInt(loanAmount * 10 ** usdcDecimals),
          rateInSPY,
          marketOutcomeIds.map((id) => BigInt(id)),
          collateralAmounts,
          BigInt(minimumLoanAmount * 10 ** usdcDecimals),
          BigInt(duration * 60 * 60 * 24),
          perpetual,
        ],
      })
      setOfferTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
    } finally {
      setIsOffering(false)
    }
  }

  const { allowance, isLoading: isAllowanceLoading } = useErc20Allowance(
    open,
    usdcAddress as `0x${string}`,
    polylendAddress as `0x${string}`,
    [isApprovalConfirmed],
  )

  const requiredAllowance = BigInt(loanAmount * 10 ** usdcDecimals)
  const hasSufficientAllowance = allowance >= requiredAllowance
  const offerIsEnabled = !isAllowanceLoading && (isApprovalConfirmed || hasSufficientAllowance)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form className="flex">
        <DialogTrigger asChild>
          <Button disabled={marketOutcomeIds.length === 0}>Offer</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>

          {/* Inputs for loan amount and rate */}
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="markets">Selected Markets</Label>
              <Input
                id="markets"
                name="markets"
                disabled
                value={`${marketOutcomeIds.length / 2} Yes | ${marketOutcomeIds.length / 2} No`}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="amount">Loan Amount (USDC)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={loanAmount.toString()}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="collateralAmount">Collateral Amount (USDC)</Label>
              <Input
                id="collateralAmount"
                name="collateralAmount"
                type="number"
                value={collateralValue.toString()}
                onChange={(e) => setCollateralValue(Number(e.target.value))}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="rate">Rate (% APY)</Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                value={rate.toString()}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="minimumLoanAmount">Minimum Loan Amount (USDC)</Label>
              <Input
                id="minimumLoanAmount"
                name="minimumLoanAmount"
                type="number"
                value={minimumLoanAmount.toString()}
                onChange={(e) => setMinimumLoanAmount(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min={Math.ceil(MINIMUM_LOAN_DURATION_SECONDS / (60 * 60 * 24)) + 1}
                value={duration.toString()}
                onChange={(e) => {
                  const minDays = Math.ceil(MINIMUM_LOAN_DURATION_SECONDS / (60 * 60 * 24)) + 1
                  const val = Number(e.target.value)
                  setDuration(val < minDays ? minDays : val)
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="perpetual">Perpetual</Label>
              <Checkbox
                checked={perpetual}
                id="perpetual"
                name="perpetual"
                onCheckedChange={(checked) => setPerpetual(!!checked)}
              />
            </div>
          </div>

          {/* Info boxes */}
          <div className="flex flex-col gap-2">
            {!offerIsEnabled && loanAmount > 0 && !isAllowanceLoading && (
              <InfoAlert text="You need to approve the contract to spend your tokens before you can make an offer. Click 'Approve' first, then 'Offer' once the approval is confirmed." />
            )}
          </div>

          {/* Buttons */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline-destructive">Cancel</Button>
            </DialogClose>
            <div className="flex items-center gap-2">
              {!offerIsEnabled && !isAllowanceLoading && (
                <LoadingActionButton
                  onClick={handleApproval}
                  disabled={loanAmount <= 0 || isApproving || isApprovalConfirming}
                  loading={isApproving || isApprovalConfirming}
                >
                  Approve
                </LoadingActionButton>
              )}
              <LoadingActionButton
                onClick={handleOffer}
                disabled={loanAmount <= 0 || rate <= 0 || duration < Math.ceil(MINIMUM_LOAN_DURATION_SECONDS / (60 * 60 * 24)) + 1 || isOffering || !offerIsEnabled}
                loading={isOffering || isOfferConfirming}
              >
                Offer
              </LoadingActionButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
