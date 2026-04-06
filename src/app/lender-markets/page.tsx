import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AllLoanData, LoanOffer } from '@/types/polyLend'
import { toUSDString } from '@/utils/convertors'
import { fetchData } from '@/utils/fetchData'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'

export default function Markets() {
  const [data, setData] = useState<AllLoanData | null>(null)

  const { address } = useConnection()

  useEffect(() => {
    fetchData({}).then(setData)
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-center text-4xl mb-4">Markets</h1>
      {data ? (
        <div className="flex gap-2">
          {data?.events.map((event) => (
            <Card key={event.slug} className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img width={40} height={40} src={event.icon} alt={event.title} />
                  <p className="text-lg font-bold">{event.title}</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-sm text-gray-500">Liquidity:</p>
                  <p className="text-sm text-gray-500">{toUSDString(event.liquidity)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm flex-1 text-gray-500">Volume:</p>
                  <p className="text-sm text-gray-500">{toUSDString(event.volume)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm flex-1 text-gray-500">Markets:</p>
                  <p className="text-sm text-gray-500">
                    {event.markets?.filter((market: any) => market.active).length} Yes{' | '}
                    {event.markets?.filter((market: any) => market.active).length} No
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm flex-1 text-primary">Offers:</p>
                  <Link to={`/all-offers?event=${event.slug}`} className="text-sm text-primary underline">
                    {data.offers.length}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm flex-1 text-primary">My Offers:</p>
                  <Link to="/lender-offers" className="text-sm text-primary underline">
                    {
                      data.offers.filter((offer: LoanOffer) => offer.lender.toLowerCase() === address?.toLowerCase())
                        .length
                    }
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" asChild>
                  <Link to={`/lender-event/${event.slug}`}>Check Market & Create Offer</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          <Card className="w-full max-w-sm">
            <CardContent className="flex items-center justify-center h-full">
              <h2 className="text-2xl font-bold">New Market Coming Soon</h2>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center py-6">
          <Spinner className="size-12 text-primary" />
        </div>
      )}
    </div>
  )
}
