import ClientOnly from "@/utils/clientOnly";
import SwitchChain from "./switchChain";

export default function SwitchWidget() {
  return (
    <div className="text-center">
      <div className="text-lg mb-5 mt-5">
        You should switch to the Polygon chain to interact with the platform
      </div>
      <ClientOnly>
        <SwitchChain />
      </ClientOnly>
    </div>
  );
}
