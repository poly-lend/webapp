import { readApprovalForAll } from "@/utils/erc1155";
import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";

export default function useIsApprovedForAll(
  enabled: boolean,
  tokenAddress: `0x${string}`,
  owner: `0x${string}` | undefined,
  operator: `0x${string}`,
  extraDeps: any[] = []
) {
  const publicClient = usePublicClient();
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    // Keep the last known approval state when the hook is disabled,
    // but reset to false if we truly lack the data to check (no client/owner).
    if (!publicClient || !owner) {
      setIsApproved(false);
      return;
    }
    if (!enabled) return;
    try {
      setIsLoading(true);
      const approved = await readApprovalForAll(
        publicClient,
        tokenAddress,
        owner,
        operator
      );
      setIsApproved(approved);
    } catch {
      setIsApproved(false);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, publicClient, tokenAddress, operator, owner]);

  useEffect(() => {
    // Trigger read on mount or when deps change
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, ...extraDeps]);

  return { isApproved, isLoading, refresh };
}
