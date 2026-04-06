# PolyLend Web App

Borrower and lender dashboard for the PolyLend peer-to-peer lending protocol on Polymarket positions.

## Tech Stack

- React 19, TypeScript, Vite
- wagmi + viem for wallet and contract interaction
- Tailwind CSS 4, Radix UI, shadcn components
- TanStack React Query for data fetching
- React Router for navigation

## Project Structure

```
src/
  app/          # Page routes (borrower-loans, lender-markets, all-offers, etc.)
  components/   # UI components and dialogs (offer, accept, repay, transfer)
  contracts/    # Contract ABIs (PolyLend, USDC, ERC1155, Safe Proxy)
  hooks/        # Custom hooks (ERC20 allowance, ERC1155 approval, proxy address)
  utils/        # Interest calculations, amount conversions, data fetching
  types/        # TypeScript types for loans, offers, positions
  config.ts     # Contract addresses and constants
```

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests
npm run lint      # Lint
npm run format    # Format with Prettier
```

## Configuration

Contract addresses and constants are in `src/config.ts`:

- `polylendAddress` - PolyLend contract (Polygon)
- `usdcAddress` - USDC token
- `polymarketTokensAddress` - Polymarket ERC1155 conditional tokens
- `MINIMUM_LOAN_DURATION_SECONDS` - 1 day minimum loan duration

## Deployment

Containerized via Dockerfile and served as static files through Caddy. See the `infra` repo for docker-compose configuration.
