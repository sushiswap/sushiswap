'use client'

import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react-v1/solid'
import { Container, LinkExternal, LinkInternal, List } from '@sushiswap/ui'
import React, { Fragment } from 'react'

import { ConnectButton } from 'src/lib/wagmi/components/connect-button'
import { useRP2ExploitCheck } from 'src/lib/wagmi/hooks/exploits/hooks/useRP2ExploitCheck'
import { useRP2ExploitClaimFinder } from 'src/lib/wagmi/hooks/exploits/hooks/useRP2ExploitClaimFinder'
import { useAccount } from 'wagmi'
import { ClaimItem } from '../components/ClaimItem'
import { Header } from '../components/Header'
import { RevokeItem } from '../components/RevokeItem'

const RP2ClaimPage = () => {
  const { address } = useAccount()

  const { data: claims, isInitialLoading: isClaimsLoading } =
    useRP2ExploitClaimFinder({
      account: address,
    })

  const { data: tokens, isInitialLoading: isLoading } = useRP2ExploitCheck({
    account: address,
  })

  return (
    <>
      <Header />
      <Container className="mx-auto py-20 pb-40 prose !prose-invert prose-slate">
        <div className="flex flex-col">
          <h1>RouteProcessor2 Exploit</h1>
          <span>
            On April 8, 2023, Sushi core contributors soft launched V3 upgrades
            for the protocol that included a new router called RouteProcessor2
            to facilitate swaps from the frontend. The router was planned to be
            used across each iteration of Sushi’s AMM pools (v2, Trident, v3),
            and to also be used for future aggregating across other protocols
            (Uni, Pancake, etc.). The RouteProcessor2 contract was deployed to
            15 networks including: Arbitrum, Arbitrum Nova, Avalanche, Boba,
            BSC, Ethereum, Fantom, Fuse, Gnosis, Moonbeam, Moonriver, Optimism,
            Polygon, and Polygon ZkEVM. Unfortunately the contract had a
            critical vulnerability. To read more about what happened, please
            refer to our{' '}
            <LinkExternal
              className="text-blue"
              href="https://www.sushi.com/blog/routeprocessor2-post-mortem"
            >
              post-mortem
            </LinkExternal>
            .
          </span>
          <hr />
          <h3>Revoke approval</h3>
          <p>
            We highly recommend you revoke approval even if you have no hacked
            funds. Without revoking approval you remain vulnerable and funds can
            get hacked later on.
          </p>
          <List className="!pt-0 pb-3 relative">
            <List.Control>
              {!address ? (
                <List.KeyValue flex title="No user connected">
                  <ConnectButton size="sm" />
                </List.KeyValue>
              ) : isLoading ? (
                <List.KeyValue skeleton />
              ) : tokens && tokens?.length > 0 ? (
                tokens.map((token) => (
                  <RevokeItem key={token.id} account={address} token={token} />
                ))
              ) : (
                <List.KeyValue flex title="No approvals found, you're good ">
                  <span className="h-[28px]" />
                </List.KeyValue>
              )}
            </List.Control>
          </List>
          <hr />
          <h3>Claim whitehacked funds</h3>
          <p className="font-semibold">
            Please revoke any token approvals you have on RouteProcessor2. Once
            you have revoked approvals, you will be able to claim any lost funds
            resulting from the exploit.
          </p>
          <List className="py-6 relative">
            <List.Control>
              {!address ? (
                <List.KeyValue flex title="No user connected">
                  <ConnectButton size="sm" />
                </List.KeyValue>
              ) : isClaimsLoading ? (
                <List.KeyValue flex title="Loading">
                  {' '}
                </List.KeyValue>
              ) : (claims?.length || 0) > 0 ? (
                claims?.map(([chainId, claim]) => (
                  <ClaimItem
                    account={address}
                    key={claim.index}
                    claim={claim}
                    chainId={chainId}
                  />
                ))
              ) : (
                <List.KeyValue flex title="No claims found">
                  <span className="h-[28px]" />
                </List.KeyValue>
              )}
            </List.Control>
            <List.Label>
              If your funds rest in the whitehat contract, they are claimable
              here
            </List.Label>
          </List>
          <p>
            If you do not see any available claims but you did get your funds
            hacked, fill in the following{' '}
            <a
              className="text-blue"
              href="https://docs.google.com/forms/d/e/1FAIpQLSd-3YitwkNyrfrgsvtNAidLry8CaMhqlfH0OKwS9rg5XNDrDQ/viewform"
            >
              form
            </a>
            . Blackhat funds will take longer to process, as the team will
            verify the legitimacy against on-chain data that validates them and
            will get paid accordingly.
          </p>
        </div>
        <hr />
        <h3>Frequently asked questions</h3>
        <ul className="p-0 m-0">
          <Disclosure as="li" className="pl-0 list-none">
            {({ open }) => (
              <>
                <Disclosure.Button as={Fragment}>
                  <h4 className="flex gap-2 items-center">
                    <ChevronRightIcon
                      width={20}
                      height={20}
                      className={open ? 'rotate-90' : ''}
                    />
                    My funds were lost in this exploit. What can I do?
                  </h4>
                </Disclosure.Button>
                <Disclosure.Panel>
                  <p>
                    Part of the lost funds got swept by whitehat security teams
                    and part of them are lost to blackhat hackers.
                  </p>
                  <ol>
                    <li>
                      If your funds rest in the whitehat contract, they will be
                      claimable from this page.
                    </li>
                    <li>
                      If you do not see any available claims but you did get
                      your funds hacked, fill in the following form{' '}
                      <a
                        className="text-blue"
                        href="https://docs.google.com/forms/d/e/1FAIpQLSd-3YitwkNyrfrgsvtNAidLry8CaMhqlfH0OKwS9rg5XNDrDQ/viewform"
                      >
                        Google Form
                      </a>
                    </li>
                  </ol>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Disclosure as="li" className="pl-0 list-none">
            {({ open }) => (
              <>
                <Disclosure.Button as={Fragment}>
                  <h4 className="flex gap-2 items-center">
                    <ChevronRightIcon
                      width={20}
                      height={20}
                      className={open ? 'rotate-90' : ''}
                    />
                    What is RouteProcessor2 Vulnerability? What happened?
                  </h4>
                </Disclosure.Button>
                <Disclosure.Panel>
                  <p>
                    There was an approval bug in a Sushi contract called
                    RouteProcessor2 and it was exploited by hackers. Money was
                    taken from users wallets. No other contract is affected.
                    Sushi liquidity is safe.
                  </p>
                  <p>
                    Please refer to our{' '}
                    <LinkInternal
                      className="text-blue"
                      href="/blog/routeprocessor2-post-mortem"
                    >
                      post-mortem
                    </LinkInternal>{' '}
                    for more information.
                  </p>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Disclosure as="li" className="pl-0 list-none">
            {({ open }) => (
              <>
                <Disclosure.Button as={Fragment}>
                  <h4 className="flex gap-2 items-center">
                    <ChevronRightIcon
                      width={20}
                      height={20}
                      className={open ? 'rotate-90' : ''}
                    />
                    Can we use Sushi safely now?
                  </h4>
                </Disclosure.Button>
                <Disclosure.Panel>
                  <p>
                    The user interface has been updated to remove the affected
                    contract. It is safe to trade and provide liquidity on
                    sushi.
                  </p>
                  <p>
                    If you have tokens approved for RouteProcessor2 on any
                    network, you should revoke the approvals as soon as
                    possible.
                  </p>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Disclosure as="li" className="pl-0 list-none">
            {({ open }) => (
              <>
                <Disclosure.Button as={Fragment}>
                  <h4 className="flex gap-2 items-center">
                    <ChevronRightIcon
                      width={20}
                      height={20}
                      className={open ? 'rotate-90' : ''}
                    />
                    My funds have been hacked but I am not seeing any claims
                    available
                  </h4>
                </Disclosure.Button>
                <Disclosure.Panel>
                  <p>
                    Your funds are most likely blackhacked, please fill in this{' '}
                    <a
                      className="text-blue"
                      href="https://docs.google.com/forms/d/e/1FAIpQLSd-3YitwkNyrfrgsvtNAidLry8CaMhqlfH0OKwS9rg5XNDrDQ/viewform"
                    >
                      form
                    </a>
                  </p>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </ul>
      </Container>
    </>
  )
}

export default RP2ClaimPage
