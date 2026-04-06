import {
  encodeFunctionData,
  parseAbi,
  PublicClient,
  WalletClient,
  type Address,
} from "viem";

const SAFE_ABI = parseAbi([
  "function nonce() view returns (uint256)",
  "function getTransactionHash(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 _nonce) view returns (bytes32)",
  "function execTransaction(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address payable refundReceiver,bytes signatures) payable returns (bool)",
]);

type SafeTx = {
  to: Address;
  value?: bigint;
  data?: `0x${string}`;
  operation?: 0 | 1; // 0 = CALL, 1 = DELEGATECALL
  safeTxGas?: bigint;
  baseGas?: bigint;
  gasPrice?: bigint;
  gasToken?: Address; // 0x000...000 for ETH
  refundReceiver?: Address; // 0x000...000 to refund tx.origin
};

// EIP-712 types used by Safe v1.3.x
const SAFE_EIP712_TYPES = {
  EIP712Domain: [
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  SafeTx: [
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "data", type: "bytes" },
    { name: "operation", type: "uint8" },
    { name: "safeTxGas", type: "uint256" },
    { name: "baseGas", type: "uint256" },
    { name: "gasPrice", type: "uint256" },
    { name: "gasToken", type: "address" },
    { name: "refundReceiver", type: "address" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

function concatHex(hexes: `0x${string}`[]): `0x${string}` {
  return ("0x" + hexes.map((h) => h.slice(2)).join("")) as `0x${string}`;
}

function packSignatures(
  sigMap: { signer: Address; sig: `0x${string}` }[]
): `0x${string}` {
  // Safe requires signatures sorted by signer address ascending
  const sorted = [...sigMap].sort((a, b) =>
    a.signer.toLowerCase().localeCompare(b.signer.toLowerCase())
  );
  return concatHex(sorted.map((s) => s.sig));
}

export async function execSafeTransaction(params: {
  safe: Address;
  tx: SafeTx;
  walletClient: WalletClient;
  publicClient: PublicClient;
  // Provide one or more owners capable of signing with walletClient
  // If multiple owners, call sign step per owner and collect signatures
  extraSignatures?: { signer: Address; sig: `0x${string}` }[];
}) {
  const { safe, tx, extraSignatures = [] } = params;
  const chainId = await params.publicClient.getChainId();
  const nonce = (await params.publicClient.readContract({
    address: safe,
    abi: SAFE_ABI,
    functionName: "nonce",
  })) as bigint;

  // Build typed data and sign
  const signatureFromThisSigner = await params.walletClient.signTypedData({
    domain: { chainId: BigInt(chainId), verifyingContract: safe },
    types: SAFE_EIP712_TYPES,
    primaryType: "SafeTx",
    account: params.walletClient.account!,
    message: {
      to: tx.to,
      value: tx.value ?? BigInt(0),
      data: tx.data ?? "0x",
      operation: tx.operation ?? 0,
      safeTxGas: tx.safeTxGas ?? BigInt(0),
      baseGas: tx.baseGas ?? BigInt(0),
      gasPrice: tx.gasPrice ?? BigInt(0),
      gasToken: tx.gasToken ?? "0x0000000000000000000000000000000000000000",
      refundReceiver:
        tx.refundReceiver ?? "0x0000000000000000000000000000000000000000",
      nonce,
    },
  });

  // Optionally verify we matched on-chain hash
  const onchainHash = (await params.publicClient.readContract({
    address: safe,
    abi: SAFE_ABI,
    functionName: "getTransactionHash",
    args: [
      tx.to,
      tx.value ?? BigInt(0),
      tx.data ?? "0x",
      tx.operation ?? 0,
      tx.safeTxGas ?? BigInt(0),
      tx.baseGas ?? BigInt(0),
      tx.gasPrice ?? BigInt(0),
      tx.gasToken ?? "0x0000000000000000000000000000000000000000",
      tx.refundReceiver ?? "0x0000000000000000000000000000000000000000",
      nonce,
    ],
  })) as `0x${string}`;

  // Collect signatures
  const sigsPacked = packSignatures([
    {
      signer: params.walletClient.account!.address as Address,
      sig: signatureFromThisSigner as `0x${string}`,
    },
    ...extraSignatures,
  ]);

  // Encode execTransaction call
  const data = encodeFunctionData({
    abi: SAFE_ABI,
    functionName: "execTransaction",
    args: [
      tx.to,
      tx.value ?? BigInt(0),
      tx.data ?? "0x",
      tx.operation ?? 0,
      tx.safeTxGas ?? BigInt(0),
      tx.baseGas ?? BigInt(0),
      tx.gasPrice ?? BigInt(0),
      tx.gasToken ?? "0x0000000000000000000000000000000000000000",
      tx.refundReceiver ?? "0x0000000000000000000000000000000000000000",
      sigsPacked,
    ],
  });

  // Send from any externally-owned account that pays gas
  const hash = await params.walletClient.sendTransaction({
    account: params.walletClient.account!,
    chain: params.publicClient.chain,
    to: safe,
    data,
    // value is almost always 0 unless calling a fallback that needs ETH
    value: BigInt(0),
  });

  return { hash, onchainHash, nonce };
}
