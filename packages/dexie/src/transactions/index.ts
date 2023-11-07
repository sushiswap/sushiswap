import type { ChainId } from 'sushi/chain'
import { db } from '../db'

type TransactionStatus = 'success' | 'pending' | 'reverted' | 'replaced'

interface Transaction {
  account: `0x${string}`
  chainId: ChainId
  hash: `0x${string}`
  payload: string
  timestamp: number
  status: TransactionStatus
}

const addTransaction = async (transaction: Omit<Transaction, 'status'>) => {
  return db
    .table('transactions')
    .add({ ...transaction, id: transaction.hash, status: 'pending' })
    .then(() => transaction)
}

const editTransactionStatus = async ({
  id,
  status,
}: { id: string; status: TransactionStatus }) => {
  return db
    .table('transactions')
    .update(id, { status })
    .then(() => ({ id, status }))
}

const getTransactions = async (
  account: `0x${string}` | undefined,
): Promise<Transaction[]> =>
  account
    ? await db
        .table('transactions')
        .where('account')
        .equals(account)
        .sortBy('timestamp')
    : []

const clearTransactions = async (
  account: `0x${string}` | undefined,
): Promise<number> => {
  return account
    ? await db.table('transactions').where('account').equals(account).delete()
    : 0
}

export {
  clearTransactions,
  addTransaction,
  editTransactionStatus,
  getTransactions,
  type Transaction,
}
