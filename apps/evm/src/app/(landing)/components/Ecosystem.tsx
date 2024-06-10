import { Button } from '@sushiswap/ui/components/button'
import { Container } from '@sushiswap/ui/components/container'
import { motion } from 'framer-motion'
import React, { FC } from 'react'

import { ExpandableCard, ExpendableCardData } from './ExpandableCard'

interface TabsExpendableCardData extends ExpendableCardData {
  summary: string
  image: string
}

const TABS: TabsExpendableCardData[] = [
  // {
  //   title: 'Furo Streaming',
  //   summary:
  //     'Automate your DAO salaries and vesting schedules while earning interest from yield strategies.',
  //   image:
  //     'https://res.cloudinary.com/sushi-cdn/image/upload/v1669286681/Frame_38656_lci5if.webp',
  //   content: (
  //     <>
  //       <p>
  //         Furo is Sushi’s payment streaming and token vesting application, a
  //         useful and efficient way of setting up automatic payments for
  //         contributors to your protocol or DAO, or for executing a company
  //         payroll.
  //       </p>
  //       <h3>Fully customizable</h3>
  //       <p>
  //         With Furo’s easy to use interface, set any number of parameters you’d
  //         like: the asset to be paid in, the frequency with which to pay them
  //         that asset, when to start paying it, when to stop paying it, etc. Or,
  //         set up traditional token vestings with optional cliffs, complete with
  //         an array of options for paying out as well.
  //       </p>
  //       <h3>Completely under your control</h3>
  //       <p>
  //         Additionally, choose to keep your funds in the Sushi Vault to accrue
  //         more yield, making your direct deposits even larger without you having
  //         to do a thing.
  //       </p>
  //     </>
  //   ),
  //   link: 'https://www.sushi.com/furo',
  //   linkText: 'Pay Someone',
  //   caption: 'For Retail Users',
  // },
  // {
  //   title: 'Kashi Lending',
  //   summary: 'Define your own risk profile. Borrow and Lend with confidence',
  //   image: 'https://res.cloudinary.com/sushi-cdn/image/upload/w_420,h_420/v1668717586/px-Frame_38657_exywa7.webp',
  //   content: (
  //     <>
  //       <span>
  //         Kashi allows for lending across a multitude of assets with varying risk tolerances, including tokens,
  //         stablecoins and synthetics.
  //       </span>
  //       <h3>Isolated risk</h3>
  //       <p>
  //         Any user can create a customized, gas-efficient market thanks to Kashi’s unique isolated markets, allowing
  //         them to define their own risk profile.{' '}
  //       </p>
  //       <p>
  //         Unlike in traditional money markets which use a pooled asset model, Kashi utilizes an isolated market model
  //         that isolates the risk to just that market, making lending exponentially safer for users who wish to do so.
  //       </p>
  //       <h3>Interest rate model</h3>
  //       <p>A variable interest rate ensures that lenders make the most yield possible, efficiently.</p>
  //     </>
  //   ),
  //   link: 'https://www.sushi.com/kashi',
  //   linkText: 'Visit Kashi',
  //   caption: 'For Retail Users',
  // },
  // {
  //   title: 'Miso Launchpad',
  //   summary:
  //     'MISO is Sushi’s permissionless launchpad where project founders can create auctions for their token listings efficiently and market them to a willing audience.',
  //   image: 'https://res.cloudinary.com/sushi-cdn/image/upload/w_420,h_420/v1668717586/px-Frame_38658_lyl2g5.webp',
  //   content: (
  //     <>
  //       <h2>For project founders</h2>
  //       <p>
  //         MISO offers a collection of open-source smart contracts directly out-of-the-box that are interoperable,
  //         allowing you the ability to easily spin up your own token listing for your project in a variety of ways,
  //         without dedicating hours to research and develop. Non-technical founders are welcome; it’s simple and
  //         intuitive to make your own listing and get it up and running quickly, without any technical or web3-specific
  //         knowledge.
  //       </p>
  //       <h3>Connect with your audience</h3>
  //       <p>
  //         The MISO marketplace helps founders abstract away a lot of the pain associated with traditional token listings
  //         by assisting the tokens in their price discovery with willing audiences via auctions or a general crowdsale,
  //         before they are to be listed on the open exchange at Sushi.
  //       </p>
  //       <h2>For participants</h2>
  //       <span>
  //         MISO’s marketplace allows users the opportunity to get in early and invest in projects that they believe in.
  //       </span>
  //       <h3>Make informed decisions</h3>
  //       <p>
  //         Users can get early exposure to projects that they believe in, all while committing the amount they feel most
  //         comfortable with and defining their own risk profile. With tons of information available on the easy-to-use
  //         interface, users have all the necessary tools to make informed business decisions and play a part in the
  //         development of the earliest stages of new projects.
  //       </p>
  //     </>
  //   ),
  //   link: 'https://www.sushi.com/miso',
  //   linkText: 'Visit Launchpad',
  //   caption: 'For Retail Users',
  // },
]

// function transformTemplate(transformProps) {
//   return `perspective(${transformProps.y.toString()}) rotateX(${transformProps.rotateX.toString()}) scale(${transformProps.scale.toString()})`
// }

export const Ecosystem: FC = () => {
  return (
    <section className="px-1 py-20 overflow-x-hidden sm:py-40">
      <Container maxWidth="5xl" className="mx-auto">
        <div className="overflow-hidden border-2 border-neutral-800 rounded-xl">
          <div className="h-[28px] flex items-center px-[10px] border-b-2 border-neutral-800 flex gap-2">
            <div className="rounded-full w-[10px] h-[10px] bg-red" />
            <div className="rounded-full w-[10px] h-[10px] bg-yellow" />
            <div className="rounded-full w-[10px] h-[10px] bg-green" />
          </div>
          <div className="prose dark:prose-invert justify-center flex flex-col gap-3 pt-10">
            <span className="text-center text-muted-foreground">Ecosystem</span>
            <h2 className="px-4 text-center">
              Explore our <span className="text-blue">DeFi</span> Payment
              Solution
            </h2>
            <div className="flex items-center p-10 min-h-[420px]">
              {TABS.map(
                ({
                  title,
                  content,
                  image: _image,
                  summary,
                  link,
                  linkText,
                  caption,
                }) => (
                  <div
                    key={title}
                    className="grid items-center grid-cols-1 gap-20 md:grid-cols-2"
                  >
                    <ExpandableCard
                      title={title}
                      caption={caption}
                      content={content}
                      link={link}
                      linkText={linkText}
                    >
                      {({ setOpen, containerId, titleId }) => (
                        <motion.div
                          layoutId={containerId}
                          className="flex flex-col items-center lg:items-start"
                        >
                          <motion.h1
                            layoutId={titleId}
                            className="text-4xl font-semibold flex flex-col items-center text-center lg:items-start lg:text-left"
                          >
                            {title}
                          </motion.h1>
                          <span className="text-lg mt-2 text-center lg:text-left mb-3">
                            {summary}
                          </span>
                          <Button
                            onClick={() => setOpen(true)}
                            variant="secondary"
                          >
                            Learn More
                          </Button>
                        </motion.div>
                      )}
                    </ExpandableCard>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
