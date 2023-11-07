import { Dexie, type Table } from 'dexie'

import { type ResolvedNotification } from './notifications'
import { type SavedToken } from './tokens'
import { type Transaction } from './transactions'

export class SushiswapDexie extends Dexie {
  notifications!: Table<ResolvedNotification & { account: string }, number>
  tokens!: Table<SavedToken, number>
  transactions!: Table<Transaction, string>

  constructor() {
    super('sushi')
    this.version(2).stores({
      notifications:
        '++id, account, chainId, href, txHash, summary, type, timestamp, groupTimestamp',
      tokens: 'id, address, chainId, decimals, name, symbol, status',
      transactions: '++id, account, chainId, hash, status, payload, timestamp',
    })
  }
}

export const db = new SushiswapDexie()
