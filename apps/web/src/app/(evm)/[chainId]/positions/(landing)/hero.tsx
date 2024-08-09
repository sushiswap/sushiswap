import { FC } from 'react'

export const Hero: FC = () => {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Manage Liquidity Positions</h1>
      <p className="text-xs text-muted-foreground max-w-[620px] leading-5">
        You can adjust and claim rewards for your liquidity positions on the
        connected network. For V2 pools, you can migrate to increase capital
        efficiency.
      </p>
    </section>
  )
}
