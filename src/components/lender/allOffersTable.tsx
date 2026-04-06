import { AllLoanData, LoanOffer } from '@/types/polyLend'
import { toAPYText, toDuration, toUSDCString } from '@/utils/convertors'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSearchParams } from 'react-router-dom'
import Address from '../widgets/address'
import EventWidget from '../widgets/event'

export default function LenderOffersTable({ data }: { data: AllLoanData }) {
  let offers = data.offers

  const [searchParams] = useSearchParams()
  const eventSlug = searchParams.get('event') ?? undefined

  const getEventFromPositionId = (positionId: string) => {
    return data.events.find((event) => event.markets?.some((market) => market.clobTokenIds.includes(positionId)))
  }

  for (const offer of offers) {
    offer.event = getEventFromPositionId(offer.positionIds[0])!
  }
  if (eventSlug) {
    offers = offers.filter((offer) => offer.event?.slug === eventSlug)
  }

  return (
    <div>
      {offers.length === 0 && <div className="text-center mt-4">No offers found</div>}
      {offers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Lender</TableHead>
              <TableHead className="text-center">Event</TableHead>
              <TableHead className="text-center">Markets</TableHead>
              <TableHead className="text-center">Total Amount</TableHead>
              <TableHead className="text-center">Minimum Amount</TableHead>
              <TableHead className="text-center">Borrowed</TableHead>
              <TableHead className="text-center">Duration</TableHead>
              <TableHead className="text-center">Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer: LoanOffer) => (
              <TableRow key={offer.offerId.toString()}>
                <TableCell align="right">
                  <Address address={offer.lender} />
                </TableCell>
                <TableCell align="center">
                  <EventWidget event={offer.event!} />
                </TableCell>
                <TableCell align="right">
                  {offer.positionIds.length / 2} Yes | {offer.positionIds.length / 2} No
                </TableCell>
                <TableCell align="right">{toUSDCString(offer.loanAmount)}</TableCell>
                <TableCell align="right">{toUSDCString(offer.minimumLoanAmount)}</TableCell>
                <TableCell align="right">{toUSDCString(offer.borrowedAmount)}</TableCell>
                <TableCell align="right">{toDuration(offer.duration)}</TableCell>
                <TableCell align="right">{toAPYText(offer.rate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
