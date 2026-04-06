import { Loan } from "@/types/polyLend";

export const fetchLoans = async (params: {
  borrower?: `0x${string}`;
  lender?: `0x${string}`;
}): Promise<Loan[]> => {
  const url = `https://api.polylend.com/loans`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch loans: ${response.statusText}`);
  }
  const loansData = await response.json();

  let loans: Loan[] = loansData.map((loan: any) => ({
    ...loan,
    loanId: loan._id,
  }));

  if (params.borrower) {
    loans = loans.filter(
      (loan: Loan) =>
        loan.borrower.toLowerCase() === params.borrower?.toLocaleLowerCase()
    );
  }

  if (params.lender) {
    loans = loans.filter(
      (loan: Loan) =>
        loan.lender.toLowerCase() === params.lender?.toLocaleLowerCase()
    );
  }

  return loans;
};
