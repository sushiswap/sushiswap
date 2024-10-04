import { ChatBubbleOvalLeftIcon, TicketIcon } from '@heroicons/react/24/solid'
import { Button } from '@sushiswap/ui'
import React, { FC } from 'react'

interface Block {
  title: string
  button: { text: string; link: string }
  icon: FC<React.ComponentProps<'svg'>>
}

function Block({ title, button, icon: Icon }: Block) {
  return (
    <div className="px-7 py-5 flex flex-row justify-between w-full space-x-4 bg-white dark:bg-opacity-5 bg-opacity-[0.12] rounded-xl border border-black border-opacity-30 dark:border-opacity-10 dark:border-white">
      <div className="flex-col flex space-y-5">
        <div>{title}</div>
        <a target="_blank" rel="noreferrer" href={button.link}>
          <Button size="xs" className="py-2 px-3">
            {button.text}
          </Button>
        </a>
      </div>
      <div className="relative w-[55px] aspect-1">
        <div className="absolute opacity-20 rounded-full bg-blue-500 w-[55px] aspect-1 bottom-0 right-0" />
        <div className="absolute opacity-20 rounded-full bg-[#F338C3] w-[52px] aspect-1 bottom-0 right-0" />
        <div className="absolute w-[55px] aspect-1 bottom-0 right-0 flex justify-center items-center pl-px text-white">
          <Icon width={26} height={26} className="w-[26px] h-[26px]" />
        </div>
      </div>
    </div>
  )
}

export function GetInTouch() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Block
        title={`Can’t find what you are looking for?`}
        button={{
          text: `Chat with us`,
          link: 'https://discord.com/channels/748031363935895552/1141943831898636410',
        }}
        icon={ChatBubbleOvalLeftIcon}
      />
      <Block
        title={`Looking for more support on a specific issue?`}
        button={{
          text: `Raise a ticket`,
          link: '',
        }}
        icon={TicketIcon}
      />
    </div>
  )
}
