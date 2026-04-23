import ReferralShare from '@/components/referralShare'
import { TableSkeleton } from '@/components/ui/tableSkeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { truncateAddress } from '@/utils/convertors'
import { fetchLeaderboard } from '@/utils/fetchLeaderboard'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'

export default function Leaderboard() {
  const { address } = useConnection()
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 30_000,
  })

  const connected = address?.toLowerCase()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-center text-4xl mb-2">Testnet Leaderboard</h1>

      <ReferralShare />

      {isLoading ? (
        <TableSkeleton columns={4} rows={10} />
      ) : !data || data.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          No points yet — be the first to interact with PolyLend on testnet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead className="text-right">Events</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const isSelf = connected && row.wallet.toLowerCase() === connected
              return (
                <TableRow key={row.wallet} className={cn(isSelf && 'bg-primary/10')}>
                  <TableCell className="font-medium">{row.rank}</TableCell>
                  <TableCell className="font-mono">
                    {truncateAddress(row.wallet)}
                    {isSelf && <span className="ml-2 text-primary text-xs font-bold">(you)</span>}
                  </TableCell>
                  <TableCell className="text-right">{row.events}</TableCell>
                  <TableCell className="text-right font-bold">{row.total}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
