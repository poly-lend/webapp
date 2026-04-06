import { AllLoanData, Market } from "@/types/polyLend";
import fetchEvents from "./fetchEvents";
import { fetchLoans } from "./fetchLoans";
import fetchMarketOutcomes, { marketToOutcome } from "./fetchMarkets";
import { fetchOffers } from "./fetchOffers";
import { hydrateLoans } from "./hydrateLoans";

export const fetchData = async (params: {
  borrower?: `0x${string}`;
  lender?: `0x${string}`;
}): Promise<AllLoanData> => {
  const [offers, loans, events] = await Promise.all([
    fetchOffers({
      address: params.lender,
    }),
    fetchLoans({
      borrower: params.borrower,
      lender: params.lender,
    }),
    fetchEvents(),
  ]);

  let positionIds = loans.map((loan) => loan.positionId.toString());
  offers.forEach((offer) => {
    offer.positionIds.forEach((positionId) => {
      positionIds.push(positionId.toString());
    });
  });

  const marketOutcomes = await fetchMarketOutcomes(positionIds);

  events.forEach((event) => {
    event.markets?.forEach((market: Market) => {
      if (!market.active) return;
      market.clobTokenIds.forEach((tokenId: string, index: number) => {
        marketOutcomes.set(tokenId, marketToOutcome(market, index));
      });
    });
  });

  const hydratedLoans = hydrateLoans(loans, marketOutcomes);

  const data = {
    marketOutcomes,
    offers,
    loans: hydratedLoans,
    events,
  };

  return data;
};
