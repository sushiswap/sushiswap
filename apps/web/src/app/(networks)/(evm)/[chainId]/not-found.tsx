import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { Button, LinkInternal, typographyVariants } from '@sushiswap/ui'
import { ChainKey } from 'sushi'
import { ChainId } from 'sushi/chain'

export default function NotFound(chainId: ChainId = ChainId.ETHEREUM) {
  return (
    <div className="flex justify-center items-center pt-20 px-4">
      <div className="flex flex-col gap-8 text-center">
        <h2
          className={typographyVariants({
            variant: 'h1',
            className: 'max-w-lg font-semibold',
          })}
        >
          Not Found
        </h2>
        <div className="flex justify-center gap-8">
          <Button
            variant="link"
            size="xl"
            asChild
            icon={ChevronRightIcon}
            iconPosition="end"
          >
            <LinkInternal href="/swap">Swap any token</LinkInternal>
          </Button>
          <Button
            variant="link"
            size="xl"
            asChild
            icon={ChevronRightIcon}
            iconPosition="end"
          >
            <LinkInternal href={`/${ChainKey[chainId]}/explore/pools`}>
              See a list of our pools
            </LinkInternal>
          </Button>
        </div>
      </div>
    </div>
  )
}
