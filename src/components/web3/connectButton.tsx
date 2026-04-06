import { useConnect } from "wagmi";
import { Button } from "../ui/button";

export function ConnectButton() {
  const { connectors, connect } = useConnect();

  return connectors.map((connector) => {
    if (connector.name !== "Injected") {
      return null;
    }
    return (
      <Button key={connector.uid} onClick={() => connect({ connector })}>
        Connect
      </Button>
    );
  });
}
