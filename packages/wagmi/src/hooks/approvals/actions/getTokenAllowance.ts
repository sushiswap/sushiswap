import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { readContract } from '@wagmi/core'
import { ChainId } from 'sushi/chain'
import { Amount, Token } from 'sushi/currency'
import { Address, erc20Abi } from 'viem'

interface GetTokenAllowance {
  chainId: ChainId
  token: Token
  owner: Address
  spender: Address
  config: PublicWagmiConfig
}

export const getTokenAllowance = async ({
  chainId,
  token,
  owner,
  spender,
  config,
}: GetTokenAllowance) => {
  const data = await readContract(config, {
    chainId,
    address: token.address as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  })
  return Amount.fromRawAmount(token, data.toString())
}
