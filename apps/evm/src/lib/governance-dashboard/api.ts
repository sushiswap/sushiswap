import { gql, request } from 'graphql-request'
import { ChainId } from 'sushi/chain'
import { SUSHI_ADDRESS } from 'sushi/currency'
import type { Address } from 'wagmi'
import { z } from 'zod'

import { DATE_FILTERS, GOV_STATUS } from './constants'
import { endOfPreviousQuarter, getPercentageDiff } from './helpers'

async function fetchUrl<T>(urlPath: string, options?: RequestInit) {
  const url = new URL(urlPath)

  return fetch(url, options).then((res) => {
    if (!res.ok) {
      console.error(res.status, res.statusText, url.href)
      return
    }
    return res.json() as T
  })
}

export async function getSushiPriceUSD() {
  const prices = await fetchUrl<{ [key: string]: number }>(
    'https://token-price.sushi.com/v2/1',
  )

  return prices?.[SUSHI_ADDRESS[ChainId.ETHEREUM]] ?? 0
}

async function getBlockNumberFromTimestamp(timestamp: number) {
  const ETH_BLOCKS_GRAPH_URL =
    'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
  const query = gql`
    query Blocks($timestamp: BigInt) {
      blocks(where: { timestamp_gte: $timestamp }, first: 1, orderBy: timestamp, orderDirection: asc) {
        number
      }
    }
  `

  const res = await request<{ blocks: { number: string }[] }>(
    ETH_BLOCKS_GRAPH_URL,
    query,
    { timestamp },
  )
  return +res.blocks[0].number
}

/* ===== Discourse (forum) & Snapshot ===== */
export interface GovernanceItem {
  type: {
    id: 'IMPLEMENTATION' | 'PROPOSAL' | 'DISCUSSION'
    title: string
    color: string
  }
  title: string
  isActive: boolean
  url: string
  category: string
}
export type GovernanceStatus = keyof typeof GOV_STATUS

const DISCOURSE_BASE_URL = 'https://forum.sushi.com/'
const DISCOURSE_PROPOSAL_ID = 8
const SNAPSHOT_URL = 'https://hub.snapshot.org/graphql'

async function fetchDiscourse<T>(path: string) {
  return Promise.resolve(undefined) as Promise<T | undefined>
  // const data = await fetchUrl<T>(DISCOURSE_BASE_URL + path, {
  //   headers: {
  //     'Api-Key': process.env.DISCOURSE_API_KEY ?? '',
  //     'Api-Username': 'sushi',
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  //     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  //   },
  // })

  // return data
}

export interface GovernanceItemsFilters {
  dateFilter: 'month' | 'quarter' | 'year' | 'all'
  sortForumPosts?: 'created' | 'activity' | 'default'
}

export async function getLatestGovernanceItems(
  filters?: GovernanceItemsFilters,
) {
  const filterSeconds = filters
    ? DATE_FILTERS.options.find((option) => option.key === filters.dateFilter)
        ?.seconds
    : null

  const forumParams = filters?.sortForumPosts
    ? new URLSearchParams({ order: filters.sortForumPosts })
    : ''
  const forumUrl = `latest.json?${forumParams.toString()}`

  const query = gql`
    query Proposals($after: Int) {
      proposals(where: { space: "sushigov.eth", created_gte: $after }, orderBy: "created", orderDirection: desc) {
        id
        title
        body
        state
        author
      }
    }
  `

  const [forumTopicsRes, forumCategoriesRes, snapshotRes] = await Promise.all([
    fetchDiscourse<{
      topic_list: {
        topics: {
          title: string
          created_at: string
          category_id: number
          slug: string
        }[]
      }
    }>(forumUrl),
    fetchDiscourse<{
      category_list: {
        categories: {
          id: number
          name: string
        }[]
      }
    }>('categories.json'),
    request<{
      proposals: {
        id: string
        title: string
        body: string
        state: 'open' | 'closed'
        author: string
      }[]
    }>(SNAPSHOT_URL, query, {
      after: filterSeconds
        ? Math.floor(new Date().getTime() / 1000) - filterSeconds
        : null,
    }),
  ])

  const snapshotProposals = snapshotRes.proposals.map((proposal) => ({
    type: GOV_STATUS.IMPLEMENTATION,
    title: proposal.title,
    isActive: proposal.state === 'open',
    url: `https://snapshot.org/#/sushigov.eth/proposal/${proposal.id}`,
    category: GOV_STATUS.IMPLEMENTATION.title,
  }))

  const forumTopics =
    forumTopicsRes?.topic_list.topics
      .filter((t) => {
        if (filterSeconds) {
          const topicCreationDateSeconds = Math.floor(
            new Date(t.created_at).getTime() / 1000,
          )
          const nowSeconds = Math.floor(new Date().getTime() / 1000)
          const filterFrom = nowSeconds - filterSeconds

          if (topicCreationDateSeconds < filterFrom) return false
        }
        return true
      })
      .map((topic) => {
        const topicType =
          topic.category_id === DISCOURSE_PROPOSAL_ID
            ? GOV_STATUS.PROPOSAL
            : GOV_STATUS.DISCUSSION

        return {
          type: topicType,
          title: topic.title,
          isActive: false,
          url: 'https://forum.sushi.com/t/' + topic.slug,
          category:
            forumCategoriesRes?.category_list.categories.find(
              (category) => category.id === topic.category_id,
            )?.name ?? topicType.title,
        }
      }) ?? []

  const res = [...snapshotProposals, ...forumTopics].reduce(
    (acc: Record<GovernanceStatus, GovernanceItem[]>, curr: GovernanceItem) => {
      acc[curr.type.id].push(curr)
      return acc
    },
    {
      IMPLEMENTATION: [],
      PROPOSAL: [],
      DISCUSSION: [],
    },
  )

  return res
}

export async function getForumStats() {
  const query = gql`
    query Space {
      space(id: "sushigov.eth") {
        proposalsCount
      }
    }
  `
  const [forumStats, proposalCountRes] = await Promise.all([
    fetchDiscourse<{
      about: {
        stats: {
          user_count: number
          active_users_7_days: number
          active_users_30_days: number
        }
      }
    }>('about.json'),
    request<{ space: { proposalsCount: number } }>(SNAPSHOT_URL, query),
  ])

  const data = {
    ...forumStats?.about.stats,
    proposalsCount: proposalCountRes.space.proposalsCount,
  }

  return data
}

/* ===== $SUSHI subgraph ===== */

const GRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/hhk-eth/sushi-ethereum'

function getTokenConcentration(
  topTenUsers: { balance: string }[],
  totalSupply: string,
) {
  const topTenBalances: bigint = topTenUsers.reduce(
    (acc: bigint, curr: { balance: string }) => acc + BigInt(curr.balance),
    BigInt(0),
  )
  const tokenConcentration =
    Number((topTenBalances * BigInt(100)) / BigInt(totalSupply)) / 100

  return tokenConcentration
}

const userCountQuery = gql`
  query UserCount {
    sushi(id: "Sushi") {
      holderCount
    }
  }
`

const holderSnapshotQuery = gql`
  query HolderSnapshot($previousQuarterBlockNumber: Int) {
    sushi(id: "Sushi") {
      holderCount
      totalSupply
    }
    previousQuarterSushiStats: sushi(id: "Sushi", block: { number: $previousQuarterBlockNumber }) {
      holderCount
      totalSupply
    }
    topTenUsers: users(first: 10, orderBy: balance, orderDirection: desc) {
      balance
    }
    previousQuarterTopTenUsers: users(
      first: 10
      orderBy: balance
      orderDirection: desc
      block: { number: $previousQuarterBlockNumber }
    ) {
      balance
    }
  }
`

const tokenHoldersQuery = gql`
  query TokenHolders(
    $usersFilter: User_filter
    $orderDirection: OrderDirection
    $first: Int
    $skip: Int
    $previousMonthBlockNumber: Int
  ) {
    sushi(id: "Sushi") {
      holderCount
      totalSupply
    }
    users(first: $first, skip: $skip, orderBy: balance, where: $usersFilter, orderDirection: $orderDirection) {
      balance
      id
    }
    previousMonthUsers: users(
      first: $first
      skip: $skip
      orderBy: balance
      where: $usersFilter
      orderDirection: $orderDirection
      block: { number: $previousMonthBlockNumber }
    ) {
      balance
      id
    }
    topTenUsers: users(first: 10, orderBy: balance, orderDirection: desc) {
      balance
    }
  }
`

interface SushiStatsGraph {
  holderCount: number
  totalSupply: string
}

interface HoldersSnapshotGraph {
  sushi: SushiStatsGraph
  previousQuarterSushiStats: SushiStatsGraph
  topTenUsers: SushiUsersGraph[]
  previousQuarterTopTenUsers: SushiUsersGraph[]
}

interface SushiUsersGraph {
  id: string
  balance: string
}

interface TokenHoldersGraph {
  sushi: SushiStatsGraph
  users: SushiUsersGraph[]
  previousMonthUsers: SushiUsersGraph[]
}

export interface TokenHoldersFilters {
  balanceFilter: number
  orderDirection: 'asc' | 'desc'
  page: number
}

export async function getHolderSnapshot() {
  const previousQuarterTimestamp = Math.floor(
    endOfPreviousQuarter(Date.now()) / 1000,
  )
  const previousQuarterBlockNumber = await getBlockNumberFromTimestamp(
    previousQuarterTimestamp,
  )

  const tokenHoldersComparisonRes = await request<HoldersSnapshotGraph>(
    GRAPH_URL,
    holderSnapshotQuery,
    {
      previousQuarterBlockNumber,
    },
  )

  const tokenConcentration = getTokenConcentration(
    tokenHoldersComparisonRes.topTenUsers,
    tokenHoldersComparisonRes.sushi.totalSupply,
  )
  const previousQuarterTokenConcentration = getTokenConcentration(
    tokenHoldersComparisonRes.previousQuarterTopTenUsers,
    tokenHoldersComparisonRes.previousQuarterSushiStats.totalSupply,
  )

  return {
    tokenConcentration,
    previousQuarterTokenConcentration,
    userCount: tokenHoldersComparisonRes.sushi.holderCount,
    previousQuarterUserCount:
      tokenHoldersComparisonRes.previousQuarterSushiStats.holderCount,
  }
}

export async function getSushiUserCount() {
  const userCountRes = await request<{
    sushi: { holderCount: number; totalSupply: number }
  }>(GRAPH_URL, userCountQuery)

  return userCountRes.sushi.holderCount
}

export async function getTokenHolders(filters?: TokenHoldersFilters) {
  const previousMonthTimestamp = Math.floor(
    (Date.now() - 30 * 86400 * 1000) / 1000,
  )
  const previousMonthBlockNumber = await getBlockNumberFromTimestamp(
    previousMonthTimestamp,
  )

  const skip = filters?.page ? (filters.page - 1) * 10 : 0
  const orderDirection = filters?.orderDirection ?? 'desc'
  const balanceFilter = filters?.balanceFilter ?? 0

  const tokenHoldersRes = await request<TokenHoldersGraph>(
    GRAPH_URL,
    tokenHoldersQuery,
    {
      orderDirection,
      usersFilter: {
        balance_gt: (BigInt(1e18) * BigInt(balanceFilter)).toString(),
      },
      skip,
      first: balanceFilter ? 1000 : 10,
      previousMonthBlockNumber,
    },
  )

  const userCount = balanceFilter
    ? tokenHoldersRes.users.length
    : tokenHoldersRes.sushi.holderCount
  const rank = orderDirection === 'desc' ? skip + 1 : userCount - skip

  const users = tokenHoldersRes.users.slice(0, 10).map((user, i) => {
    const balance = Math.trunc(+user.balance) / 1e18
    const previousMonthData = tokenHoldersRes.previousMonthUsers.find(
      (u) => u.id === user.id,
    )
    const previousMonthBalance = previousMonthData
      ? Math.trunc(+previousMonthData.balance) / 1e18
      : 0
    const balanceChange30days = previousMonthBalance
      ? getPercentageDiff(balance, previousMonthBalance)
      : 1

    return {
      ...user,
      rank: rank + i,
      balance,
      balanceChange30days,
    }
  })

  const res = {
    users,
    userCount,
    totalSupply: tokenHoldersRes.sushi.totalSupply,
  }

  return res
}

/* ===== Defillama ===== */

export async function getTreasuryHistoricalTvl() {
  const allBalances = await fetchUrl<{
    chainTvls: {
      [group: string]: {
        tvl: {
          date: number
          totalLiquidityUSD: number
        }[]
      }
    }
  }>('https://api.llama.fi/treasury/sushi')

  if (!allBalances) return []

  const combinedData: Record<number, number> = {}

  for (const group in allBalances.chainTvls) {
    // defillama: skip sum of keys like ethereum-staking, arbitrum-vesting
    if (group.includes('-') || group.toLowerCase() === 'offers') continue

    allBalances.chainTvls[group].tvl.forEach(({ date, totalLiquidityUSD }) => {
      if (!combinedData[date]) {
        combinedData[date] = 0
      }
      combinedData[date] += totalLiquidityUSD
    })
  }

  const result = Object.entries(combinedData).map(
    ([date, totalLiquidityUSD]) => ({
      date,
      value: totalLiquidityUSD as number,
    }),
  )

  return result
}

export const TREASURY_ADDRESS = '0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3'

/* ===== Zapper ===== */

const ZAPPER_BASE_URL = 'https://api.zapper.xyz/v2/'

const SUSHI_WALLETS = [
  '0x19B3Eb3Af5D93b77a5619b047De0EED7115A19e7',
  '0x850a57630a2012b2494779fbc86bbc24f2a7baef',
  '0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3',
  '0x1219bfa3a499548507b4917e33f17439b67a2177',
  '0x978982772b8e4055b921bf9295c0d74eb36bc54e',
  '0xf9e7d4c6d36ca311566f46c81e572102a2dc9f52',
  '0x5ad6211cd3fde39a9cecb5df6f380b8263d1e277',
  '0xa19b3b22f29e23e4c04678c94cfc3e8f202137d8',
  '0x1026cbed7b7E851426b959BC69dcC1bf5876512d', // merkle distributor
  '0xcbe6b83e77cdc011cc18f6f0df8444e5783ed982', // merkle distributor
]

const SUSHI_NETWORKS = ['ethereum', 'polygon', 'optimism', 'arbitrum', 'fantom']

async function fetchZapper<T>(path: string) {
  const encodedKey = Buffer.from(`${process.env.ZAPPER_API_KEY}:`).toString(
    'base64',
  )

  const data = await fetchUrl<T>(ZAPPER_BASE_URL + path, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedKey}`,
    },
    cache: 'no-store',
  })

  return data
}

function getZapperParams() {
  const params = new URLSearchParams()

  for (const sushiAddress of SUSHI_WALLETS) {
    params.append('addresses[]', sushiAddress)
  }
  for (const network of SUSHI_NETWORKS) {
    params.append('networks[]', network)
  }

  return params
}

export async function getTreasuryVestingValue() {
  const params = getZapperParams()

  const appBalances = await fetchZapper<{ balanceUSD: number }[]>(
    `balances/apps?${params.toString()}`,
  )
  const totalVestingValue = appBalances?.reduce(
    (acc, curr) => acc + curr.balanceUSD,
    0,
  )
  return totalVestingValue
}

interface ZapperToken {
  id: string
  address: Address
  name: string
  symbol: string
  price: number
  balance: number
  balanceUSD: number
  decimals: number
}
interface ZapperBalance {
  address: Address
  network: string
  token: ZapperToken
}

export interface TreasuryBalance {
  id: string
  token: {
    address: Address
    name: string
    symbol: string
    chainId: number
    decimals: number
    isNative: boolean
  }
  price: number
  balance: number
  balanceUSD: number
  portfolioShare: number
}

export interface TreasurySnapshot {
  totalValueUsd: number
  balancesValueUsd: number
  vestingValueUsd: number
  balances: TreasuryBalance[]
}

export async function getTreasurySnapshot() {
  const params = getZapperParams()

  const [tokenBalances, appBalances] = await Promise.all([
    fetchZapper<{ [key: string]: ZapperBalance[] }>(
      `balances/tokens?${params.toString()}`,
    ),
    fetchZapper<{ balanceUSD: number }[]>(`balances/apps?${params.toString()}`),
  ])

  const flattened = tokenBalances
    ? Object.values(tokenBalances)
        .flat()
        .map((b) => ({ ...b.token, network: b.network }))
        .filter((i) => i.balanceUSD > 10_000)
    : []

  const combined = flattened.reduce(
    (acc: (ZapperToken & { network: string })[], curr) => {
      const existingToken = acc.find(({ symbol }) => symbol === curr.symbol)
      if (existingToken) {
        existingToken.price += curr.price
        existingToken.balance += curr.balance
        existingToken.balanceUSD += curr.balanceUSD
      } else {
        acc.push({ ...curr })
      }
      return acc
    },
    [],
  )

  const balancesValueUsd = combined.reduce(
    (acc, curr) => acc + Number(curr.balanceUSD),
    0,
  )
  const vestingValueUsd =
    appBalances?.reduce((acc, curr) => acc + curr.balanceUSD, 0) ?? 0
  const totalValueUsd = balancesValueUsd + vestingValueUsd

  const NETWORK_TO_ID = {
    ethereum: 1,
    polygon: 137,
    optimism: 10,
    arbitrum: 42161,
    fantom: 250,
  }

  const balances: TreasuryBalance[] = combined.map((info) => {
    const portfolioShare = info.balanceUSD / balancesValueUsd
    const token = {
      address: info.address,
      name: info.name,
      symbol: info.symbol,
      chainId: NETWORK_TO_ID[info.network as keyof typeof NETWORK_TO_ID],
      decimals: info.decimals,
      isNative: info.address === '0x0000000000000000000000000000000000000000',
    }
    return {
      id: info.id,
      token,
      portfolioShare,
      price: info.price,
      balance: info.balance,
      balanceUSD: info.balanceUSD,
    }
  })

  return {
    balancesValueUsd,
    balances,
    vestingValueUsd,
    totalValueUsd,
  }
}

/* ===== Notion ===== */

interface NotionDateField {
  type: 'date'
  date: { start: string }
}

interface NotionTextField {
  type: 'rich_text'
  rich_text: [{ plain_text: string }]
}

interface NotionTitleField {
  type: 'title'
  title: [{ plain_text: string }]
}

interface NotionUrlField {
  type: 'url'
  url: string
}

interface NotionNumberField {
  type: 'number'
  number: number
}

interface NotionFormulaField {
  type: 'formula'
  formula: NotionNumberField
}

interface NotionSelectField {
  type: 'select'
  select: { name: string }
}
interface NotionEvent {
  properties: {
    Date: NotionDateField
    'Location (City, Country)': NotionTextField
    'Event URL': NotionUrlField
    'Event Name': NotionTitleField
    Image: NotionUrlField
  }
}

interface NotionBudget {
  properties: {
    Design: NotionNumberField
    Revenue: NotionNumberField
    BizDev: NotionNumberField
    Engineering: NotionNumberField
    Marketing: NotionNumberField
    Expenses: NotionFormulaField
    Quarter: NotionSelectField
    Left: NotionFormulaField
    Others: NotionNumberField
    Budget: NotionNumberField
    Month: NotionTitleField
  }
}

interface NotionNetflow {
  properties: {
    Month: NotionTitleField
    Inflow: NotionNumberField
    Outflow: NotionNumberField
  }
}

function getNotionFieldValue(
  row: {
    properties: {
      [key: string]:
        | NotionDateField
        | NotionTextField
        | NotionTitleField
        | NotionUrlField
        | NotionNumberField
        | NotionFormulaField
        | NotionSelectField
    }
  },
  fieldName: string,
) {
  const field = row.properties[fieldName]
  switch (field.type) {
    case 'date':
      return field.date.start
    case 'rich_text':
      return field.rich_text[0].plain_text
    case 'title':
      return field.title[0].plain_text
    case 'url':
      return field.url
    case 'number':
      return field.number
    case 'formula':
      return field.formula.number
    case 'select':
      return field.select.name
    default:
      console.error(
        `Unknown field type for ${fieldName}: ${JSON.stringify(field)}`,
      )
  }
}

const SushiEvent = z.object({
  imgUrl: z.string(),
  title: z.string(),
  date: z.string(),
  location: z.string(),
  eventUrl: z.string(),
})

export type SushiEvent = z.infer<typeof SushiEvent>

const SushiBudget = z.object({
  quarter: z.string(),
  expenses: z.number(),
  revenue: z.number(),
  budget: z.number(),
  left: z.number(),
  expensesBreakdown: z
    .object({
      teamName: z.string(),
      expense: z.number(),
    })
    .array(),
})

export type SushiBudget = z.infer<typeof SushiBudget>

const SushiTokenNetflow = z.object({
  month: z.string(),
  inflow: z.number(),
  outflow: z.number(),
})

export type SushiTokenNetflow = z.infer<typeof SushiTokenNetflow>

const NOTION_VERSION = '2022-06-28'

async function fetchNotionDatabase<T>(databaseId: string) {
  const data = await fetchUrl<{ results: T }>(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
      },
      method: 'POST',
    },
  )

  return data?.results
}

export async function getNotionEvents() {
  const EVENTS_DB_ID = 'f2ab0048afd842c38ab4a21e2ceb121f'
  const notionEvents = await fetchNotionDatabase<NotionEvent[]>(EVENTS_DB_ID)

  const propertyNames = [
    'Date',
    'Location (City, Country)',
    'Event Name',
    'Image URL',
    'Event URL',
  ]
  const events: SushiEvent[] =
    notionEvents
      ?.filter((e) => e.properties['Event Name'].title.length)
      .map((event) => {
        const [date, location, title, imgUrl, eventUrl] = propertyNames.map(
          (name) => getNotionFieldValue(event, name),
        )
        const sushiEvent = SushiEvent.parse({
          date,
          location,
          title,
          imgUrl,
          eventUrl,
        })
        return sushiEvent
      }) ?? []

  return events
}

export async function getNotionBudget() {
  const BUDGET_DB_ID = 'bd11844610cf4203a92c4058bdefdd08'
  const notionBudget = await fetchNotionDatabase<NotionBudget[]>(BUDGET_DB_ID)

  const propertyNames = [
    'Quarter',
    'Revenue',
    'Budget',
    'Expenses',
    'Engineering',
    'BizDev',
    'Marketing',
    'Design',
    'Others',
    'Left',
  ]

  const sushiBudgets =
    notionBudget
      ?.filter((b) => b.properties.Expenses.formula.number)
      .map((budgetRow) => {
        const [
          quarter,
          revenue,
          budget,
          expenses,
          engineeringExpense,
          bdExpense,
          marketingExpense,
          designExpense,
          othersExpense,
          left,
        ] = propertyNames.map((name) => getNotionFieldValue(budgetRow, name))
        const expensesBreakdown = [
          { teamName: 'Design', expense: designExpense },
          { teamName: 'BizDev', expense: bdExpense },
          { teamName: 'Engineering', expense: engineeringExpense },
          { teamName: 'Marketing', expense: marketingExpense },
          { teamName: 'Others', expense: othersExpense },
          { teamName: 'Available Budget', expense: left },
        ]

        const sushiBudget = SushiBudget.parse({
          quarter,
          expenses,
          revenue,
          budget,
          expensesBreakdown,
          left,
        })
        return sushiBudget
      }) ?? []

  return sushiBudgets
}

export async function getNotionTokenNetflow() {
  const NETFLOW_DB_ID = '4ac4261888374ba6a1863792f2bd2fc0'
  const notionNetflow =
    await fetchNotionDatabase<NotionNetflow[]>(NETFLOW_DB_ID)

  const propertyNames = ['Month', 'Inflow', 'Outflow']

  const sushiNetflows =
    notionNetflow
      ?.filter((b) => b.properties.Month.title.length)
      .map((budgetRow) => {
        const [month, inflow, outflow] = propertyNames.map((name) =>
          getNotionFieldValue(budgetRow, name),
        )

        const sushiNetflow = SushiTokenNetflow.parse({ month, inflow, outflow })
        return sushiNetflow
      }) ?? []

  return sushiNetflows
}
