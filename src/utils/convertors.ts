import { parseEther } from 'viem'
import { polymarketSharesDecimals, usdcDecimals } from '../config'

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60
const ETHER = parseEther('1')

export const toUSDCString = (amount: bigint | string | number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) / 10 ** usdcDecimals)
}

export const toUSDString = (amount: bigint | string | number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount))
}

export const toDuration = (seconds: number | bigint | string) => {
  if (Number(seconds) <= 0) return '0m'

  const totalSeconds = Number(seconds)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if ((minutes > 0 && days < 1) || parts.length === 0) parts.push(`${minutes}m`)

  return parts.join(' ')
}

export const truncateAddress = (address: `0x${string}`) => {
  return address.slice(0, 6) + '...' + address.slice(-4)
}

export const toSharesText = (amount: number | bigint | string) => {
  return (Number(amount) / 10 ** polymarketSharesDecimals).toFixed(1)
}

export const toSPYWAI = (apy: number): bigint => {
  const rate = 1 + apy
  const value = rate ** (1 / SECONDS_PER_YEAR)
  return parseEther(value.toString())
}

export const toAPY = (spy: bigint | string) => {
  let value = BigInt(spy)

  return (Number(value) / Number(ETHER)) ** SECONDS_PER_YEAR - 1
}

export const toAPYText = (spy: bigint | string) => {
  return (toAPY(spy) * 100).toFixed(2) + '%'
}
