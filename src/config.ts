import { chainConfig } from './chainConfig'

export const usdcAddress = chainConfig.usdcAddress
export const usdcDecimals = chainConfig.usdcDecimals

export const polylendDecimals = chainConfig.polylendDecimals
export const polymarketSharesDecimals = chainConfig.polymarketSharesDecimals

export const proxyAddress = chainConfig.proxyAddress
export const polylendAddress = chainConfig.polylendAddress
export const polymarketTokensAddress = chainConfig.polymarketTokensAddress

export const MINIMUM_LOAN_DURATION_SECONDS = 24 * 60 * 60 // 1 day, matches PolyLend.MINIMUM_LOAN_DURATION
