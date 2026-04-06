import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { ExternalLink, Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import ClientOnly from '../utils/clientOnly'
import ConnectWallet from './web3/connectWallet'
import SwitchChain from './web3/switchChain'
import Balance from './widgets/balance'

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className={cn('sticky z-20 top-0 w-full bg-background/95 backdrop-blur', mobileOpen && 'shadow-md')}>
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile logo */}
            <Link to="/" className="flex items-center md:hidden">
              <img src="/logo.png" alt="logo" className="h-10 w-auto" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:block">
              <NavigationMenu viewport={false}>
                <NavigationMenuList className="gap-4 items-center flex">
                  <NavigationMenuItem className="mr-2 lg:mr-6">
                    <a href="https://polylend.com" className="flex items-center">
                      <img src="/logo.png" alt="logo" className="h-12 w-auto" />
                    </a>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <a href="https://polylend.com" className={cn(navigationMenuTriggerStyle())}>
                        <div className="flex items-center gap-1.5 text-base font-bold">Home</div>
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/" className={cn(navigationMenuTriggerStyle(), pathname === '/' && 'text-primary')}>
                        <div className="flex items-center gap-1.5 text-base font-bold">Borrow</div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/borrower-loans"
                        className={cn(navigationMenuTriggerStyle(), pathname === '/borrower-loans' && 'text-primary')}
                      >
                        <div className="flex items-center gap-1.5 text-base font-bold">Loans</div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <a href="https://docs.polylend.com" target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-1.5 text-base font-bold">
                          Docs
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop wallet controls */}
            <div className="hidden md:flex items-center gap-4 font-bold">
              <ClientOnly>
                <SwitchChain />
              </ClientOnly>
              <ClientOnly>
                <div className="text-right">
                  <Balance />
                </div>
              </ClientOnly>
              <ClientOnly>
                <ConnectWallet />
              </ClientOnly>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border border-b bg-background pb-4 shadow-md">
            <a
              href="https://polylend.com"
              className="flex items-center justify-between py-2 text-base font-semibold"
            >
              Home
            </a>
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between py-2 text-base font-semibold',
                pathname === '/borrow' && 'text-primary',
              )}
            >
              <span className="flex items-center gap-1.5">Borrow</span>
            </Link>

            <Link
              to="/borrower-loans"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between py-2 text-base font-semibold',
                pathname === '/borrower-loans' && 'text-primary',
              )}
            >
              <span className="flex items-center gap-1.5">Loans</span>
            </Link>

            <a
              href="https://docs.polylend.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2 text-base font-semibold"
            >
              <span className="flex items-center gap-1.5">
                Docs
                <ExternalLink className="h-4 w-4" />
              </span>
            </a>

            <div className="mt-4 flex flex-col gap-3 font-bold">
              <ClientOnly>
                <SwitchChain />
              </ClientOnly>
              <ClientOnly>
                <Balance />
              </ClientOnly>
              <ClientOnly>
                <ConnectWallet />
              </ClientOnly>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
