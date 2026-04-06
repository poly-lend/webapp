export type Market = {
  id: string
  groupItemTitle: string
  icon: string
  question: string
  clobTokenIds: string[]
  outcomes: string[]
  outcomePrices: number[]
  events: Event[]
  active: boolean
  liquidityNum: string
}

export type MarketOutcome = {
  market: Market
  outcome: string
  outcomePrice: number
  outcomeIndex: number
  event: Event | null
}

export type Event = {
  slug: string
  icon: string
  title: string
  liquidity: string
  volume: string
  description: string
  markets: Market[] | null
}

export type LoanOffer = {
  remainingDays: number
  offerId: string
  lender: `0x${string}`
  loanAmount: string
  rate: string
  positionIds: string[]
  collateralAmounts: string[]
  minimumLoanAmount: string
  duration: string
  startTime: string
  borrowedAmount: string
  perpetual: boolean
  event: Event | null
}

export type Loan = {
  loanId: string
  borrower: `0x${string}`
  borrowerWallet: `0x${string}`
  lender: `0x${string}`
  positionId: string
  collateralAmount: string
  loanAmount: string
  rate: string
  startTime: string
  callTime: string
  minimumDuration: string
  offer: LoanOffer
  marketOutcome: MarketOutcome
}

export type AllLoanData = {
  events: Event[]
  offers: LoanOffer[]
  marketOutcomes: Map<string, MarketOutcome>
  loans: Loan[]
}
