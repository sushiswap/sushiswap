import { IToken } from '~tron/_common/types/token-type'

const alwaysTrue = () => true

export function createTokenFilterFunction<T extends IToken>(
  search: string,
): (tokens: T) => boolean {
  // const isValidAddress = isAddress(search)

  // if (isValidAddress) {
  // }
  // if ((search.startsWith("0x") && search.length > 65) || search == "0x1::aptos_coin::AptosCoin") {
  // 	return (t: T) => search.toLowerCase() === t.address.toLowerCase();
  // }

  const lowerSearchParts = search
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0)

  if (lowerSearchParts.length === 0) return alwaysTrue

  const matchesSearch = (s: string): boolean => {
    const sParts = s
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)

    return lowerSearchParts.every(
      (p) =>
        p.length === 0 ||
        sParts.some((sp) => sp.startsWith(p) || sp.endsWith(p)),
    )
  }

  return ({ name, symbol }: T): boolean =>
    Boolean((symbol && matchesSearch(symbol)) || (name && matchesSearch(name)))
}

export function filterTokens<T extends IToken>(
  tokens: T[],
  search: string,
): T[] {
  return tokens.filter(createTokenFilterFunction(search))
}

export const tokenComparator = () => {
  return (tokenA: IToken, tokenB: IToken): number => {
    if (tokenA.symbol && tokenB.symbol) {
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1
    } else {
      return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0
    }
  }
}

export function getSortedTokensByQuery(
  tokens: IToken[] | undefined,
  searchQuery: string,
): IToken[] {
  if (!tokens) {
    return []
  }

  if (searchQuery === '') {
    return tokens
  }

  const symbolMatch = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((s) => s.length > 0)

  if (symbolMatch.length > 1) {
    return tokens
  }

  const exactMatches: IToken[] = []
  const symbolSubstrings: IToken[] = []
  const rest: IToken[] = []

  // sort tokens by exact match -> subtring on symbol match -> rest
  tokens.map((token) => {
    if (token.symbol?.toLowerCase() === symbolMatch[0]) {
      return exactMatches.push(token)
    } else if (
      token.symbol?.toLowerCase().startsWith(searchQuery.toLowerCase().trim())
    ) {
      return symbolSubstrings.push(token)
    } else {
      return rest.push(token)
    }
  })

  return [...exactMatches, ...symbolSubstrings, ...rest]
}
