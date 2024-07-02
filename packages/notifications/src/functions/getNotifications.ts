import { getDatabase } from '../database.js'

export async function getNotifications(
  account: string | `0x${string}` | undefined,
) {
  const database = await getDatabase()

  if (!database) {
    throw new Error('Database not initialized')
  }

  if (account) {
    return database.getAllFromIndex('notifications', 'by-account', account)
  }

  return database.getAll('notifications')
}
