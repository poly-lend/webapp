import { polylendAddress } from '@/config'
import { polylendConfig } from '@/contracts/polylend'
import { AllLoanData, LoanOffer } from '@/types/polyLend'
import { toAPYText, toDuration, toUSDCString } from '@/utils/convertors'
import { useEffect, useState } from 'react'
import { BaseError } from 'viem'
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from 'wagmi'
import LoadingActionButton from '../widgets/loadingActionButton'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import EventWidget from '../widgets/event'

export default function LenderOffersTable({
  data,
  userAddress,
  onDataRefresh,
}: {
  data: AllLoanData
  userAddress: `0x${string}`
  onDataRefresh: () => void
}) {
  let offers = data.offers
  offers = offers.filter((offer) => offer.lender === userAddress)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [cancellingOfferId, setCancellingOfferId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelTxHash, setCancelTxHash] = useState<`0x${string}` | undefined>(undefined)
  const { isLoading: isCancelConfirming, isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({
    hash: cancelTxHash,
  })

  useEffect(() => {
    if (isCancelConfirmed) {
      toast.success('Offer canceled successfully')
      onDataRefresh()
      setCancellingOfferId(null)
      setCancelTxHash(undefined)
    }
  }, [isCancelConfirmed])

  const cancelOffer = async (offerId: string) => {
    if (!publicClient || !walletClient) return
    try {
      setCancellingOfferId(offerId)
      setIsCancelling(true)
      const hash = await walletClient.writeContract({
        address: polylendAddress as `0x${string}`,
        abi: polylendConfig.abi,
        functionName: 'cancelOffer',
        args: [BigInt(offerId)],
      })
      setCancelTxHash(hash)
    } catch (err) {
      const message = (err as BaseError)?.shortMessage || (err as Error)?.message || 'Transaction failed'
      toast.error(message)
      setCancellingOfferId(null)
    } finally {
      setIsCancelling(false)
    }
  }

  const getEventFromPositionId = (positionId: string) => {
    return data.events.find((event) => event.markets?.some((market) => market.clobTokenIds.includes(positionId)))
  }

  return (
    <div>
      {offers.length === 0 && <div className="text-center mt-4">No offers found</div>}
      {offers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Event</TableHead>
              <TableHead className="text-center">Markets</TableHead>
              <TableHead className="text-center">Collateral Value</TableHead>
              <TableHead className="text-center">Total Amount</TableHead>
              <TableHead className="text-center">Minimum Amount</TableHead>
              <TableHead className="text-center">Borrowed</TableHead>
              <TableHead className="text-center">Duration</TableHead>
              <TableHead className="text-center">Rate</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer: LoanOffer) => (
              <TableRow key={offer.offerId.toString()}>
                <TableCell align="center">
                  <EventWidget event={getEventFromPositionId(offer.positionIds[0])!} />
                </TableCell>
                <TableCell align="right">
                  {offer.positionIds.length / 2} Yes | {offer.positionIds.length / 2} No
                </TableCell>
                <TableCell align="right">TBD</TableCell>
                <TableCell align="right">{toUSDCString(offer.loanAmount)}</TableCell>
                <TableCell align="right">{toUSDCString(offer.minimumLoanAmount)}</TableCell>
                <TableCell align="right">{toUSDCString(offer.borrowedAmount)}</TableCell>
                <TableCell align="right">{toDuration(offer.duration)}</TableCell>
                <TableCell align="right">{toAPYText(offer.rate)}</TableCell>
                <TableCell align="right">
                  <LoadingActionButton
                    variant="outline-destructive"
                    onClick={() => cancelOffer(offer.offerId)}
                    loading={cancellingOfferId === offer.offerId && (isCancelling || isCancelConfirming)}
                  >
                    Cancel
                  </LoadingActionButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
