import LoadingActionButton from '@/components/widgets/loadingActionButton'
import { usdcAddress } from '@/config'
import { usdcConfig } from '@/contracts/usdc'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { BaseError, parseUnits } from 'viem'
import { useConnection, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

const MINT_AMOUNT = parseUnits('1000', 6)

export default function GetTestUsdcButton() {
  const { address, chain } = useConnection()
  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (isSuccess) {
      toast.success('Minted 1,000 pfUSDC')
      reset()
    }
  }, [isSuccess, reset])

  if (!address || chain?.id !== 31337) return null

  const handleClick = () => {
    writeContract(
      {
        address: usdcAddress,
        abi: usdcConfig.abi,
        functionName: 'mint',
        args: [address, MINT_AMOUNT],
      },
      {
        onError: (err) => {
          const message = (err as BaseError)?.shortMessage ?? (err as Error)?.message ?? 'Mint failed'
          toast.error(message)
        },
      },
    )
  }

  return (
    <LoadingActionButton variant="outline" loading={isPending || isConfirming} onClick={handleClick}>
      Get Test USDC
    </LoadingActionButton>
  )
}
