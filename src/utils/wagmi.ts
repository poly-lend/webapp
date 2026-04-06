import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const chain = polygon;

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [injected()],
  transports: {
    [chain.id]: http(),
  },
  //ssr: true, // If your dApp uses server side rendering (SSR)
});

export const queryClient = new QueryClient();
