import { LoanOffer } from '@/types/polyLend'

export const fetchOffers = async (params: { address?: `0x${string}` }): Promise<LoanOffer[]> => {
  const url = `https://api.polylend.com/offers`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch offers: ${response.statusText}`)
  }
  const offersData = await response.json()

  let offers: LoanOffer[] = offersData.map((offer: any, index: number) => ({
    ...offer,
    offerId: offer._id,
    positionIds: offer.positionIds.map((positionId: any) => positionId),
    remainingDays: Math.floor(
      (new Date((Number(offer.startTime) + Number(offer.duration)) * 1000).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    ),
  }))
  offers = offers.filter((offer: LoanOffer) => offer.remainingDays > 0)
  offers = offers.filter(
    (offer: LoanOffer) => BigInt(offer.loanAmount) - BigInt(offer.borrowedAmount) > BigInt(offer.minimumLoanAmount),
  )
  if (params.address) {
    offers = offers.filter((offer: LoanOffer) => offer.lender.toLowerCase() === params.address?.toLocaleLowerCase())
  }

  return offers
}
