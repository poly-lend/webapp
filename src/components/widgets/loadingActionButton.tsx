import { ReactNode } from "react";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type LoadingActionButtonProps = {
  children: ReactNode;
  loading?: boolean;
} & React.ComponentProps<typeof Button>;

export default function LoadingActionButton({
  children,
  loading = false,
  disabled,
  className,
  ...buttonProps
}: LoadingActionButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("relative", className)}
      {...buttonProps}
    >
      <span className={loading ? "invisible" : "visible"}>{children}</span>
      {loading && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </Button>
  );
}
