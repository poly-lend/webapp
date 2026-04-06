import { usdcAddress } from '@/config'

export const erc20AllowanceAbi = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
  },
] as const

export const erc20BalanceAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256', name: '' }],
  },
] as const

export async function readAllowance(
  publicClient: any,
  tokenAddress: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`,
): Promise<bigint> {
  const result = (await publicClient.readContract({
    address: tokenAddress,
    abi: erc20AllowanceAbi,
    functionName: 'allowance',
    args: [owner, spender],
  })) as bigint
  return result
}

export async function readBalance(publicClient: any, account: `0x${string}`): Promise<bigint> {
  const result = (await publicClient.readContract({
    address: usdcAddress,
    abi: erc20BalanceAbi,
    functionName: 'balanceOf',
    args: [account],
  })) as bigint
  return result
}
