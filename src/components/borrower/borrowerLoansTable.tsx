import { AllLoanData } from '@/types/polyLend'
import { calculateAmountOwed } from '@/utils/calculations'
import { toAPYText, toDuration, toSharesText, toUSDCString } from '@/utils/convertors'
import RepayDialog from '../dialogs/repayDialog'
import Address from '../widgets/address'
import Market from '../widgets/market'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import OutcomeBadge from '../widgets/outcomeBadge'

export default function BorrowerLoansTable({
  data,
  onDataRefresh,
}: {
  borrower?: `0x${string}`
  lender?: `0x${string}`
  data: AllLoanData
  onDataRefresh: () => void
}) {
  const loans = data.loans

  return (
    <div>
      {loans.length === 0 && <div className="text-center">No loans found</div>}
      {loans.length > 0 && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Lender</TableHead>
                <TableHead className="text-center">Market</TableHead>
                <TableHead className="text-center"> Side </TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Collateral</TableHead>
                <TableHead className="text-right">Borrowed</TableHead>
                <TableHead className="text-right">Owed</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Time Left</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.loanId}>
                  <TableCell align="center">
                    <Address address={loan.lender} />
                  </TableCell>
                  <TableCell align="center" className="whitespace-normal">
                    <Market marketOutcome={loan.marketOutcome} />
                  </TableCell>
                  <TableCell align="center">
                    <OutcomeBadge outcome={loan.marketOutcome.outcome} />
                  </TableCell>
                  <TableCell align="right">{toSharesText(loan.collateralAmount)}</TableCell>
                  <TableCell align="right">
                    {toUSDCString(Number(loan.marketOutcome.outcomePrice) * Number(loan.collateralAmount))}
                  </TableCell>
                  <TableCell align="right">{toUSDCString(loan.loanAmount)}</TableCell>
                  <TableCell align="right">
                    {toUSDCString(
                      calculateAmountOwed(Number(loan.loanAmount), Number(loan.rate), Number(loan.startTime)),
                    )}
                  </TableCell>
                  <TableCell align="right">{toDuration(Number(loan.minimumDuration))}</TableCell>
                  <TableCell align="right">
                    {toDuration(Number(loan.minimumDuration) - (Date.now() / 1000 - Number(loan.startTime)))}
                  </TableCell>
                  <TableCell align="right">{toAPYText(loan.rate)}</TableCell>
                  <TableCell align="right">
                    <RepayDialog loanId={loan.loanId} startTime={loan.startTime} onDataRefresh={onDataRefresh} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
