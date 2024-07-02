import { getDatabase } from '../database.js'
import { updateEvent } from '../events.js'
import {
  type PromiseNotification,
  type ResolvedNotification,
  isPromiseNotification,
} from '../types'

export async function addNotification(
  notification: PromiseNotification | ResolvedNotification,
) {
  const database = await getDatabase()

  if (!database) {
    throw new Error('Database not initialized')
  }

  if (!notification.account) {
    console.error('Cant create notification for account: undefined')
    return
  }

  if (isPromiseNotification(notification)) {
    const id = await database.add('notifications', {
      account: notification.account,
      chainId: notification.chainId,
      href: notification.href ?? '',
      txHash: notification.txHash ?? '',
      summary: notification.summary.pending,
      type: notification.type,
      timestamp: notification.timestamp,
      groupTimestamp: notification.groupTimestamp,
    })

    const data = await database.get('notifications', id)

    if (!data) {
      throw new Error('Notification not found')
    }

    notification.promise
      .then(() =>
        database!.put(
          'notifications',
          {
            ...data,
            summary: notification.summary.completed,
          },
          id,
        ),
      )
      .catch(() =>
        database!.put(
          'notifications',
          {
            ...data,
            summary: notification.summary.failed,
          },
          id,
        ),
      )
  } else {
    await database.add('notifications', {
      account: notification.account,
      chainId: notification.chainId,
      href: notification.href ?? '',
      txHash: notification.txHash ?? '',
      summary: notification.summary,
      type: notification.type,
      timestamp: notification.timestamp,
      groupTimestamp: notification.groupTimestamp,
    })
  }

  dispatchEvent(updateEvent)
}
