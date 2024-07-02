import { type DBSchema, type IDBPDatabase, openDB } from 'idb'

import type { ResolvedNotification } from './types'

interface NotificationDatabase extends DBSchema {
  notifications: {
    value: ResolvedNotification
    key: number
    indexes: { 'by-account': string }
  }
}

let _database: IDBPDatabase<NotificationDatabase> | undefined = undefined

export async function getDatabase() {
  if (typeof localStorage === 'undefined') {
    return
  }

  if (_database) {
    return _database
  }

  _database = await openDB<NotificationDatabase>('notifications', 1, {
    upgrade(db) {
      const notificationStore = db.createObjectStore('notifications', {
        autoIncrement: true,
      })

      notificationStore.createIndex('by-account', 'account')
    },
  })

  return _database
}
