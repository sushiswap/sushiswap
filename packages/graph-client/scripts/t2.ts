import { getPools } from '../src/subgraphs/data-api/queries/pools'

const a = await getPools({ chainId: '42161' })

console.log('pools api:', a.length )
