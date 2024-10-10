import { Container } from '@sushiswap/ui'
import { BarBalanceCard } from 'src/ui/stake/BarBalanceCard'
import { BarBalanceProvider } from 'src/ui/stake/BarBalanceProvider'
import { BarChartCard } from 'src/ui/stake/BarChartCard'
import { ManageBarCard } from 'src/ui/stake/ManageBarCard'
import { VotingPowerCard } from 'src/ui/stake/VotingPowerCard'
import { VotingPowerProvider } from 'src/ui/stake/VotingPowerProvider'

export default async function Page() {
  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4">
      <VotingPowerProvider>
        <VotingPowerCard />
      </VotingPowerProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div>
          <ManageBarCard />
        </div>
        <div className="flex flex-col gap-6">
          <BarBalanceProvider>
            <BarBalanceCard />
          </BarBalanceProvider>
          <BarChartCard />
        </div>
      </div>
      {/* <div className="py-4">
    <Separator />
  </div> */}
    </Container>
  )
}
