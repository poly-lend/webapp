import { MarketOutcome } from "@/types/polyLend";
import { ExternalLink } from "lucide-react";

const Market = ({
  marketOutcome,
  eventSlug,
}: {
  marketOutcome: MarketOutcome;
  eventSlug?: string;
}) => {
  const eventSlugParam = eventSlug || marketOutcome?.event?.slug;
  return (
    <a
      href={`https://polymarket.com/event/${eventSlugParam}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center hover:underline hover:text-white/80"
    >
      <img
        width={40}
        height={40}
        src={marketOutcome.market.icon}
        alt={marketOutcome.market.question}
        className="rounded-full mr-2"
      />

      <div className="flex items-center gap-1 text-sm text-left mr-1">
        <p className={`line-clamp-2 min-w-0 max-w-[400px]`}>
          {marketOutcome.market.question}
        </p>
        <ExternalLink className="w-4 h-4 shrink-0" />
      </div>
    </a>
  );
};

export default Market;
