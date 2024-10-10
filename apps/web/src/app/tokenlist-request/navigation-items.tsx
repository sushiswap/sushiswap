import { Container, LinkInternal } from '@sushiswap/ui'
import { PathnameButton } from 'src/ui/pathname-button'

export function NavigationItems() {
  return (
    <Container maxWidth="7xl" className="px-4 flex gap-2 pb-4">
      <LinkInternal shallow={true} scroll={false} href="/tokenlist-request">
        <PathnameButton
          id="my-positions"
          pathname="/tokenlist-request"
          asChild
          size="sm"
        >
          New token
        </PathnameButton>
      </LinkInternal>
      <LinkInternal
        shallow={true}
        scroll={false}
        href="/tokenlist-request/pending"
      >
        <PathnameButton
          id="my-rewards"
          pathname="/tokenlist-request/pending"
          asChild
          size="sm"
        >
          Pending
        </PathnameButton>
      </LinkInternal>
      <LinkInternal
        shallow={true}
        scroll={false}
        href="/tokenlist-request/approved"
      >
        <PathnameButton
          id="migrate"
          pathname="/tokenlist-request/approved"
          asChild
          size="sm"
        >
          Approved
        </PathnameButton>
      </LinkInternal>
    </Container>
  )
}
