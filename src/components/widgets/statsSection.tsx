import { useEffect, useState } from 'react'

const API_URL = 'https://api.polylend.com'

type Stats = {
  totalLiquidity: number
  totalBorrowed: number
  activeLoans: number
  activeOffers: number
  uniqueLenders: number
  uniqueBorrowers: number
}

const formatUSDC = (raw: number) => {
  const amount = raw / 1e6
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return `$${amount.toFixed(0)}`
}

const statCards = (stats: Stats) => [
  { label: 'Total Liquidity', value: formatUSDC(stats.totalLiquidity) },
  { label: 'Total Borrowed', value: formatUSDC(stats.totalBorrowed) },
  { label: 'Active Loans', value: stats.activeLoans.toString() },
  { label: 'Active Offers', value: stats.activeOffers.toString() },
  { label: 'Unique Lenders', value: stats.uniqueLenders.toString() },
  { label: 'Unique Borrowers', value: stats.uniqueBorrowers.toString() },
]

export default function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats) return null

  return (
    <section className="border-t border-slate-900 pt-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-3 justify-between">
        <h2 className="text-lg font-semibold text-slate-50">Protocol Stats</h2>
        <div className="max-w-md text-xs leading-relaxed text-slate-300">
          Live on-chain data from the PolyLend protocol.
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {statCards(stats).map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-center"
          >
            <p className="text-xl font-semibold bg-linear-to-r from-(--brand-yellow) to-(--brand-yellow-soft) bg-clip-text text-transparent">
              {value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
