import { truncateAddress } from "@/utils/convertors";
import { ExternalLink } from "lucide-react";

export default function Address({ address }: { address: `0x${string}` }) {
  return (
    <a href={`https://polygonscan.com/address/${address}`} target="_blank" rel="noopener noreferrer">
      <div className="flex items-center gap-1 justify-end text-primary hover:text-primary/90 hover:underline">
        {truncateAddress(address)} <ExternalLink className="w-4 h-4" />
      </div>
    </a>
  );
}
