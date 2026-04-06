import { Badge } from "../ui/badge";

function OutcomeBadge({ outcome }: { outcome: string }) {
  return (
    <Badge variant={outcome === "Yes" ? "yes" : "destructive"}>{outcome}</Badge>
  );
}

export default OutcomeBadge;
