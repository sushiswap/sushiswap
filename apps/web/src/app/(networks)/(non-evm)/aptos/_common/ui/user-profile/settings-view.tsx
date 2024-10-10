import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import React, { FC, Fragment } from 'react'

import { RadioGroup } from '@headlessui/react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { IconButton, List, classNames } from '@sushiswap/ui'
import { useTheme } from 'next-themes'
import { ProfileView } from './user-profile'

interface SettingsViewProps {
  setView: React.Dispatch<React.SetStateAction<ProfileView>>
}

const map = {
  system: <span className="text-xs font-semibold">Auto</span>,
  light: <SunIcon width={24} height={24} />,
  dark: <MoonIcon width={20} height={20} />,
}

export const SettingsView: FC<SettingsViewProps> = ({ setView }) => {
  const { theme, setTheme } = useTheme()
  return (
    <>
      <div className="grid grid-cols-3 mb-3">
        <div className="flex justify-start">
          <IconButton
            size="sm"
            onClick={() => setView(ProfileView.Default)}
            icon={ArrowLeftIcon}
            name="Back"
          />
        </div>
        <span className="font-medium text-center">Settings</span>
        <div />
      </div>
      <List>
        <List.Label>Preferences</List.Label>
        <List.Control className="bg-gray-100 dark:bg-slate-800">
          <List.KeyValue flex title="Theme">
            <RadioGroup value={theme} onChange={setTheme}>
              <div className="items-center relative bg-black/[0.04] dark:bg-white/[0.02] ring-4 ring-black/[0.04] dark:ring-white/[0.02] rounded-lg overflow-hidden flex gap-1">
                {Object.entries(map).map(([k, v], i) => (
                  <RadioGroup.Option as={Fragment} key={i} value={k}>
                    {({ checked }) => (
                      <button
                        type="button"
                        className={classNames(
                          checked
                            ? 'text-gray-900 dark:text-slate-50 bg-white dark:bg-white/[0.08]'
                            : 'text-gray-500 dark:text-slate-500 hover:bg-gray-100 hover:dark:bg-white/[0.04]',
                          'min-w-[60px] z-[1] relative rounded-lg text-sm h-8 font-medium flex flex-grow items-center justify-center',
                        )}
                      >
                        {v}
                      </button>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </List.KeyValue>
        </List.Control>
      </List>
    </>
  )
}
