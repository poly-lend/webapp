export type LeaderboardRow = {
  rank: number
  wallet: `0x${string}`
  total: number
  events: number
}

export const fetchLeaderboard = async (): Promise<LeaderboardRow[]> => {
  const response = await fetch('https://api-testnet.polylend.com/testnet/leaderboard')
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`)
  }
  return response.json()
}
