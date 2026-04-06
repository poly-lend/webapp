import { Market, MarketOutcome } from "@/types/polyLend";

export function transformMarkets(markets: any[]): Market[] {
  return markets.map((market) => ({
    id: market.id,
    groupItemTitle: market.groupItemTitle,
    clobTokenIds: JSON.parse(market.clobTokenIds),
    outcomes: JSON.parse(market.outcomes),
    outcomePrices: market.outcomePrices
      ? JSON.parse(market.outcomePrices).map(Number)
      : [],
    events: market.events,
    active: market.active,
    icon: market.icon,
    question: market.question,
    liquidityNum: market.liquidityNum,
  }));
}

export function marketToOutcome(market: Market, index: number): MarketOutcome {
  return {
    market,
    outcome: market.outcomes[index],
    outcomePrice: market.outcomePrices[index],
    outcomeIndex: index,
    event: market.events && market.events.length > 0 ? market.events[0] : null,
  };
}

export default async function fetchMarketOutcomes(
  tokenIds: string[]
): Promise<Map<string, MarketOutcome>> {
  if (tokenIds.length === 0) {
    return new Map<string, MarketOutcome>();
  }
  const params = tokenIds
    .map((tokenId) => `clob_token_ids=${tokenId}`)
    .join("&");
  const url = `https://api.polylend.com/markets?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch markets: ${response.statusText}`);
  }

  const markets = transformMarkets(await response.json());

  const result = new Map<string, MarketOutcome>();
  markets.forEach((market: any) => {
    if (!market.active) return;
    market.clobTokenIds.forEach((tokenId: string, index: number) => {
      result.set(tokenId, marketToOutcome(market, index));
    });
  });
  return result;
}
