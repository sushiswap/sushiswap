import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { clearNotifications, useNotifications } from '@sushiswap/notifications'
import { Button, IconButton, List } from '@sushiswap/ui'
import React, { Dispatch, FC, SetStateAction } from 'react'

import { NotificationGroup } from './NotificationGroup'
import { ProfileView } from './ProfileView'

interface TransactionsProps {
  address: `0x${string}`
  setView: Dispatch<SetStateAction<ProfileView>>
}

export const TransactionsView: FC<TransactionsProps> = ({
  setView,
  address,
}) => {
  const notifications = useNotifications({ account: address })

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <IconButton
          size="sm"
          onClick={() => setView(ProfileView.Default)}
          icon={ArrowLeftIcon}
          name="Back"
        />
        <Button
          onClick={() => clearNotifications({ account: address })}
          variant="ghost"
          size="sm"
          className="!px-2"
        >
          Clear all
        </Button>
      </div>
      <List>
        <List.Label>Transactions</List.Label>
        <List.Control className="bg-gray-100 dark:bg-slate-700">
          <div className="flex flex-col gap-3 max-h-[300px] scroll">
            {notifications && Object.keys(notifications).length > 0 ? (
              Object.entries(notifications)
                .reverse()
                .map(([, notifications], index) => {
                  return (
                    <NotificationGroup
                      key={index}
                      notifications={notifications}
                    />
                  )
                })
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">
                Your transactions will appear here
              </p>
            )}
          </div>
        </List.Control>
      </List>
    </>
  )
}
