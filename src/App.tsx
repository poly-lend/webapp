import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient, wagmiConfig } from '@/utils/wagmi'
import { Toaster } from '@/components/ui/sonner'
import Nav from '@/components/nav'
import Bottom from '@/components/bottom'

import Home from '@/app/page'
import AllOffers from '@/app/all-offers/page'
import BorrowerLoans from '@/app/borrower-loans/page'
import LenderLoans from '@/app/lender-loans/page'
import LenderMarkets from '@/app/lender-markets/page'
import LenderEvent from '@/app/lender-event/page'
import LenderOffers from '@/app/lender-offers/page'

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Nav />
          <div className="w-full max-w-7xl mx-auto px-4 flex-1 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/all-offers" element={<AllOffers />} />
              <Route path="/borrower-loans" element={<BorrowerLoans />} />
              <Route path="/lender-loans" element={<LenderLoans />} />
              <Route path="/lender-markets" element={<LenderMarkets />} />
              <Route path="/lender-event/:id" element={<LenderEvent />} />
              <Route path="/lender-offers" element={<LenderOffers />} />
            </Routes>
          </div>
          <Bottom />
          <Toaster position="bottom-center" richColors />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
