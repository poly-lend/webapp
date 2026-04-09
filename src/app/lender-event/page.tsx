import OfferDialog from '@/components/dialogs/offerDialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import ConnectWallet from '@/components/web3/connectWallet'
import { Event, Market, MarketOutcome } from '@/types/polyLend'
import ClientOnly from '@/utils/clientOnly'
import { toUSDString } from '@/utils/convertors'
import { fetchData } from '@/utils/fetchData'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'

export default function OfferDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [markets, setMarkets] = useState<Market[] | null>(null)
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const { address } = useConnection()
  const [marketOutcomes, setMarketOutcomes] = useState<Map<string, MarketOutcome>>(new Map())

  const calculateCheckAllStatus = (selectedMarkets: string[], markets: Market[]) => {
    if (selectedMarkets?.length === 0) {
      return false
    } else if (selectedMarkets?.length === markets?.length * 2) {
      return true
    } else {
      return 'indeterminate'
    }
  }

  const handleSelectMarket = (marketOutcomeIds: string[]) => {
    setSelectedMarkets([...(selectedMarkets || []), ...marketOutcomeIds])
  }

  const handleUnselectMarket = (marketOutcomeIds: string[]) => {
    setSelectedMarkets(selectedMarkets?.filter((m: string) => !marketOutcomeIds.includes(m)))
  }

  useEffect(() => {
    fetchData({}).then((data) => {
      const event = data.events.find((event: Event) => event.slug === id)
      if (!event) return
      let markets = event?.markets?.filter((market: Market) => market.active)
      markets = markets!.sort((a: Market, b: Market) => Number(b.outcomePrices[0]) - Number(a.outcomePrices[0]))
      setEvent(event)
      setMarkets(markets)
      setMarketOutcomes(data.marketOutcomes)
    })
  }, [])

  return (
    <div>
      {markets ? (
        <>
          <h1 className="font-bold text-4xl mb-4 flex items-center gap-2">
            <Checkbox
              checked={calculateCheckAllStatus(selectedMarkets, markets)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedMarkets(
                    markets!.reduce((acc: string[], market: Market) => [...acc, ...market.clobTokenIds], []) || [],
                  )
                } else {
                  setSelectedMarkets([])
                }
              }}
            />
            <img width={40} height={40} src={event?.icon} alt={event?.title} />
            <span className="flex-1">{event?.title}</span>
            {address ? (
              <OfferDialog
                marketOutcomeIds={selectedMarkets}
                marketOutcomes={marketOutcomes}
                onSuccess={async () => {
                  navigate('/lender-offers')
                }}
              />
            ) : (
              <ClientOnly>
                <ConnectWallet />
              </ClientOnly>
            )}
          </h1>
          <div className="flex flex-col gap-2">
            {markets?.map((market: Market) => (
              <div key={market.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedMarkets.includes(market.clobTokenIds[0])}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSelectMarket(market.clobTokenIds)
                    } else {
                      handleUnselectMarket(market.clobTokenIds)
                    }
                  }}
                />
                <img width={40} height={40} src={market.icon} alt={market.groupItemTitle} />
                <p className="font-bold text-lg flex-1 flex flex-col gap-2">
                  {market.groupItemTitle}
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Liquidity:</span>
                    {toUSDString(market.liquidityNum)}
                  </span>
                </p>
                <p className="text-lg">{Math.round(market.outcomePrices[0] * 100)}%</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 flex flex-col gap-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
