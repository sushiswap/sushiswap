import { Container } from '@sushiswap/ui'
import React from 'react'

import { KpiReportButton } from './KpiReportButton'
import { Socials } from './Socials'
import { Stats } from './Stats'
import { TabList } from './TabList'

export function Hero() {
  return (
    <>
      <div className="h-px bg-gradient-to-r from-[#0993EC]/20 to-[#F338C3]/20" />
      <div className="bg-gradient-to-r from-[#0993EC]/10 to-[#F338C3]/[5%] pt-8 md:pt-14 bg-[#404C68] dark:bg-[#101728B2]">
        <Container maxWidth="6xl" className="mx-auto flex justify-between gap-4 px-4">
          <div>
            <p className="text-sm font-medium text-[#E3E8EF] dark:text-slate-400">Last Update: May 21, 2023</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">
              <p className="text-gray-50">Welcome to Sushi</p>
              <p className="bg-gradient-to-r from-[#0993EC] to-[#F338C3] bg-clip-text text-transparent">
                <span>Governance</span> <span className="bg-gray-50 bg-clip-text">& Treasury</span>
              </p>
            </h1>
            <Socials />
            <div className="mt-8 md:mt-14">
              <KpiReportButton />
            </div>
            <div className="mt-8 md:mt-14">
              <TabList />
            </div>
          </div>
          <Stats />
        </Container>
      </div>
    </>
  )
}
