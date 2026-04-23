import { Button } from '@/components/ui/button'
import { fetchReferralCode } from '@/utils/referral'
import { useQuery } from '@tanstack/react-query'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useConnection } from 'wagmi'

export default function ReferralShare() {
  const { address } = useConnection()
  const { data: code } = useQuery({
    queryKey: ['referralCode', address],
    queryFn: () => fetchReferralCode(address as `0x${string}`),
    enabled: !!address,
  })

  if (!address) return null
  if (!code) return null

  const url = `${window.location.origin}/?ref=${code}`

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Referral link copied')
    } catch {
      toast.error('Could not copy — copy the URL manually')
    }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Invite testers, earn 10 points each</p>
        <p className="text-xs text-muted-foreground font-mono break-all">{url}</p>
      </div>
      <Button size="sm" onClick={onCopy} className="shrink-0">
        <Copy className="h-4 w-4 mr-1" /> Copy link
      </Button>
    </div>
  )
}
