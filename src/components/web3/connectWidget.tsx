import ClientOnly from "@/utils/clientOnly";
import ConnectWallet from "../web3/connectWallet";

export default function ConnectWidget() {
  return (
    <div className="text-center">
      <div className="text-lg mb-5 mt-5">
        Connect your wallet to interact with the platform and see your data
      </div>
      <ClientOnly>
        <ConnectWallet />
      </ClientOnly>
    </div>
  );
}
