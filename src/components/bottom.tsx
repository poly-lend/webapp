import DexScreenerIcon from './svgs/dexscreenerIcon'
import GithubIcon from './svgs/githubIcon'
import TelegramIcon from './svgs/telegramIcon'
import XIcon from './svgs/xIcon'

export default function Bottom() {
  return (
    <footer className="border-t py-4 text-center text-sm w-full flex max-w-7xl mx-auto">
      <div className="flex-1"></div>
      <div className="flex items-center justify-center gap-5 mr-4">
        <DexScreenerIcon />
        <GithubIcon />
        <TelegramIcon />
        <XIcon />
      </div>
    </footer>
  )
}
