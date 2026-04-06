import { polylendAddress } from "@/config";
import { polylendConfig } from "@/contracts/polylend";

export const fetchAmountOwed = async (params: {
  publicClient: any;
  loanId: string;
  timestamp: bigint;
}): Promise<bigint> => {
  const owed = (await params.publicClient.readContract({
    address: polylendAddress as `0x${string}`,
    abi: polylendConfig.abi,
    functionName: "getAmountOwed",
    args: [BigInt(params.loanId), params.timestamp],
  })) as bigint;
  return owed;
};
