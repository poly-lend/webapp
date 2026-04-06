import { Loan, MarketOutcome } from "@/types/polyLend";

export const hydrateLoans = (
  loans: Loan[],
  marketOutcomes: Map<string, MarketOutcome>
) => {
  return loans.map((loan) => {
    return {
      ...loan,
      marketOutcome: marketOutcomes.get(loan.positionId.toString())!,
    };
  });
};
