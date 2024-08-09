// shorten the checksummed version of the input hash to have 0x + 4 characters at start and end
export function shortenHash(hash: string, characters = 4): string {
  try {
    return `${hash.substring(0, characters + 2)}...${hash.substring(
      hash.length - characters,
    )}`
  } catch {
    throw `Invalid 'hash' parameter '${hash}'.`
  }
}
