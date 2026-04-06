export const erc1155ApprovalForAllAbi = [
  {
    type: "function",
    name: "isApprovedForAll",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ type: "uint256", name: "" }],
  },
] as const;

export async function readApprovalForAll(
  publicClient: any,
  tokenAddress: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`
): Promise<boolean> {
  const result = (await publicClient.readContract({
    address: tokenAddress,
    abi: erc1155ApprovalForAllAbi,
    functionName: "isApprovedForAll",
    args: [owner, spender],
  })) as boolean;
  return result;
}
