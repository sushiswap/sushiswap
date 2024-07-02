import { Disclosure } from '@headlessui/react'
import { FC } from 'react'

import type { ResolvedNotification } from '@sushiswap/notifications'
import { Notification } from './Notification'

interface NotificationGroupProps {
  notifications: ResolvedNotification[]
}

export const NotificationGroup: FC<NotificationGroupProps> = ({
  notifications,
}) => {
  return (
    <Disclosure>
      {({ open }) => {
        return (
          <div className="relative">
            {notifications.length > 1 && open && (
              <div className="absolute left-[33px] top-7 bottom-7 w-0.5 bg-gradient-to-t from-gray-300 dark:from-red to-blue" />
            )}
            <Notification
              data={notifications[0]}
              showExtra={notifications.length > 1}
            />
            {notifications.length > 1 && (
              <Disclosure.Panel className="border-b border-gray-900/5 dark:border-slate-200/5">
                {notifications.map((el, idx) => {
                  if (idx > 0) {
                    return <Notification key={idx} data={el} hideStatus />
                  }
                })}
              </Disclosure.Panel>
            )}
          </div>
        )
      }}
    </Disclosure>
  )
}
