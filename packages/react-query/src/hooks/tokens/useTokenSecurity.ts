import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { z } from 'zod'

const SUPPORTED_CHAIN_IDS = [
  ChainId.AVALANCHE,
  ChainId.BSC,
  ChainId.FANTOM,
  ChainId.GNOSIS,
  ChainId.HARMONY,
  ChainId.ETHEREUM,
  ChainId.HECO,
  ChainId.ARBITRUM,
  ChainId.OPTIMISM,
  ChainId.ZKSYNC_ERA,
  ChainId.LINEA,
  ChainId.BASE,
  ChainId.POLYGON,
] as const

export const TokenSecurityChainIds = SUPPORTED_CHAIN_IDS

export type TokenSecurityChainId = typeof SUPPORTED_CHAIN_IDS[number]

export const isTokenSecurityChainId = (
  chainId: ChainId,
): chainId is TokenSecurityChainId =>
  SUPPORTED_CHAIN_IDS.includes(chainId as TokenSecurityChainId)

const bit = z.optional(z.enum(['0', '1']).transform((val) => val !== '0'))

const tokenSecuritySchema = z.object({
  is_open_source: bit,
  is_proxy: bit,
  is_mintable: bit,
  can_take_back_ownership: bit,
  owner_change_balance: bit,
  hidden_owner: bit,
  selfdestruct: bit,
  external_call: bit,
  gas_abuse: bit,
  buy_tax: z.optional(
    z.preprocess(
      (val) => (val === '' ? undefined : val !== '0'),
      z.optional(z.boolean()),
    ),
  ),
  sell_tax: z.optional(
    z.preprocess(
      (val) => (val === '' ? undefined : val !== '0'),
      z.optional(z.boolean()),
    ),
  ),
  cannot_buy: bit,
  cannot_sell_all: bit,
  slippage_modifiable: bit,
  is_honeypot: bit,
  transfer_pausable: bit,
  is_blacklisted: bit,
  is_whitelisted: bit,
  is_anti_whale: bit,
  trading_cooldown: bit,
  is_true_token: bit,
  is_airdrop_scam: bit,
  trust_list: bit,
})

export type TokenSecurity = z.infer<typeof tokenSecuritySchema>

export type TokenSecurityResponse = Record<string, TokenSecurity>

type GoPlusAPIResponse = Record<string, Record<keyof TokenSecurity, string>>

export const TokenSecurityLabel: Record<keyof TokenSecurity, string> = {
  is_open_source: 'Contract Verified',
  is_proxy: 'Proxy Contract',
  is_mintable: 'Mintable',
  can_take_back_ownership: 'Reclaimable Ownership',
  owner_change_balance: 'Balance Modifiable',
  hidden_owner: 'Hidden Owner',
  selfdestruct: 'Includes selfdestruct()',
  external_call: 'Includes External Call',
  gas_abuse: 'Abuses Gas',
  buy_tax: 'Buy Tax',
  sell_tax: 'Sell Tax',
  cannot_buy: 'Not Buyable',
  cannot_sell_all: 'Unable to Sell All',
  slippage_modifiable: 'Slippage Modifiable',
  is_honeypot: 'Honeypot',
  transfer_pausable: 'Transfer Pausable',
  is_blacklisted: 'Includes Blacklist',
  is_whitelisted: 'Includes Whitelist',
  is_anti_whale: 'Anti-whale Mechanism',
  trading_cooldown: 'Trading Cooldown',
  is_true_token: 'True Token',
  is_airdrop_scam: 'Airdrop Scam',
  trust_list: 'Trusted',
}

export const TokenSecurityMessage: Record<keyof TokenSecurity, string> = {
  //Contract Security
  is_open_source:
    'Whether or not this token contract is open source. You can check the contract code for details. Unsourced token contracts are likely to have malicious functions to defraud their users of their assets.',
  is_proxy:
    'Whether or not there is a proxy in the contract. The proxy contract means contract owner can modifiy the function of the token and possibly effect the price.',
  is_mintable:
    'Whether or not this contract contains a visible mint function. Hidden mint functions may increase the amount of tokens in circulation and effect the price of the token.',
  can_take_back_ownership:
    'Whether or not this contract contains a function that allows the project owner to regain ownership even after relinquishing it.',
  owner_change_balance:
    'Whether or not the contract owner is found to have the authority to modify the balance of tokens at other addresses.',
  hidden_owner:
    'Whether or not a hidden owner address was found for the token. For contract with a hidden owner, developer can still manipulate the contract even if the ownership has been abandoned.',
  selfdestruct:
    'If a self-destruct function exists and is triggered, the contract will be destroyed, all functions will be unavailable, and all related assets will be erased.',
  external_call:
    'External calls would cause this token contract to be highly dependent on other contracts, which may be a potential risk.',
  gas_abuse:
    'Indicates whether any gas abuse activity has been detected in this contract.',
  //Trading security
  buy_tax:
    'Whether or not this token contract includes a buy tax. A buy tax will cause the actual token value received to be less than the amount paid. An excessive buy tax may lead to heavy losses.',
  sell_tax:
    'Whether or not this token contract includes a sell tax. A sell tax will cause the actual value received when selling a token to be less than expected, and too much sell tax may lead to large losses.',
  cannot_buy:
    'Whether or not this token can be purchased directly by users. Generally, these unbuyable tokens would be found in Reward Tokens. Such tokens are issued as rewards for some on-chain applications.',
  cannot_sell_all:
    'Whether or not a user can sell all of their tokens in a single sale.',
  slippage_modifiable:
    'Whether or not the contract owner can modify the buy tax or sell tax of the token. This may cause some losses, especially since some contracts have unlimited modifiable tax rates, which would make the token untradeable.',
  is_honeypot:
    "Whether or not the token is a honeypot, meaning that the token maybe cannot be sold because of the token contract's function, or the token contains malicious code.",
  transfer_pausable:
    "Indicating the contract owner's ability to suspend trading, preventing users from selling, except for those with special authority.",
  is_blacklisted:
    'Whether or not a blacklist function is included. If there is a blacklist, some addresses may not be able to trade normally (honeypot risk).',
  is_whitelisted:
    'Whether or not a whitelist function is included. If there is a whitelist, some addresses may not be able to trade normally (honeypot risk).',
  is_anti_whale:
    'Whether the contract has the function to limit the maximum amount of transactions or the maximum token position for a single address.',
  trading_cooldown:
    'Whether the contract has a trading-cool-down mechanism that can limit the minimum time between two transactions.',
  //Info security
  is_true_token: 'Whether or not this token is true or fake.',
  is_airdrop_scam: 'Whether or not this token is an airdrop scam',
  trust_list: 'Whether or not this token is a famous and trustworthy one.',
}

const fetchTokenSecurityQueryFn = async (currencies: (Token | undefined)[]) => {
  const supportedCurrencies = currencies.filter(
    (currency) => currency && isTokenSecurityChainId(currency.chainId),
  ) as Token[]

  if (supportedCurrencies.length === 0) return {} as TokenSecurityResponse

  const tokenSecurity = await Promise.all(
    supportedCurrencies.map((currency) =>
      fetch(
        `https://api.gopluslabs.io/api/v1/token_security/${currency.chainId}?contract_addresses=${currency.address}`,
      )
        .then(
          (response) =>
            response.json() as Promise<{ result?: GoPlusAPIResponse }>,
        )
        .then((data) => data?.result?.[currency.address.toLowerCase()])
        .then((tokenSecurityResponse) =>
          tokenSecuritySchema.parse(tokenSecurityResponse),
        ),
    ),
  )

  return supportedCurrencies.reduce((prev, cur, i) => {
    prev[cur.address] = tokenSecurity[i] as TokenSecurity
    return prev
  }, {} as TokenSecurityResponse)
}

export const useTokenSecurity = ({
  currencies,
  enabled = true,
  ...rest
}: UseQueryOptions<Awaited<ReturnType<typeof fetchTokenSecurityQueryFn>>> & {
  currencies: (Token | undefined)[]
}) => {
  return useQuery({
    queryKey: ['useTokenSecurity', currencies?.map((currency) => currency?.id)],
    queryFn: () => fetchTokenSecurityQueryFn(currencies),
    enabled,
    keepPreviousData: true,
    staleTime: 900000, // 15 mins
    cacheTime: 86400000, // 24hs
    ...rest,
  })
}
