import { Hero } from '../components/home/Hero'
import { Discover } from '../components/home/Discover'
import { ContinueListening } from '../components/home/ContinueListening'
import { RecentlyPlayed } from '../components/home/RecentlyPlayed'

export function Home() {
  return (
    <div className="space-y-12">
      <Hero />
      <Discover />
      <ContinueListening />
      <RecentlyPlayed />
    </div>
  )
}