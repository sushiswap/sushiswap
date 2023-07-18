import React from 'react'

import { HolderSnapshot } from '../components/HolderSnapshot'
import { getSushiPriceUSD, getTokenHolders, TokenHoldersFilters } from '../lib'
import { TokenHoldersTable } from './TokenHoldersTable'

export default async function TokenHolders({ searchParams }: { searchParams: TokenHoldersFilters }) {
  const [tokenHolders, sushiPrice] = await Promise.all([getTokenHolders(searchParams), getSushiPriceUSD()])

  const totalSupply = Math.trunc(+tokenHolders.totalSupply ?? 0) / 1e18

  const users = tokenHolders.users.map(({ id, balance, balanceChange30days, rank }) => ({
    id,
    rank,
    address: id,
    quantity: balance,
    ownership: balance / totalSupply,
    value: balance * sushiPrice,
    change30d: balanceChange30days,
  }))

  return (
    <section className="space-y-14">
      <HolderSnapshot />
      <TokenHoldersTable users={users} userCount={tokenHolders.userCount} />
    </section>
  )
}
