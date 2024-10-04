import { getFaqCategories } from '@sushiswap/graph-client/strapi'
import { Container } from '@sushiswap/ui'
import {
  Sidebar,
  SidebarDesktop,
  SidebarMobile,
} from '../../../components/sidebar'

export const revalidate = 900

interface CategoryLayoutProps {
  children: React.ReactNode
}

function CategoryLayoutDesktop({
  children,
  sidebar,
}: { children: React.ReactNode; sidebar: Sidebar }) {
  return (
    <Container
      maxWidth="4xl"
      className="justify-between pb-40 pt-24 px-8 space-x-16 grid grid-cols-10 h-full"
    >
      <div className="col-span-2">
        <SidebarDesktop {...sidebar} />
      </div>
      <div className="h-full dark:bg-slate-600 bg-[#BFBFBF] w-[2px]" />
      <div className="col-span-7">{children}</div>
    </Container>
  )
}

function CategoryLayoutMobile({
  children,
  sidebar,
}: { children: React.ReactNode; sidebar: Sidebar }) {
  return (
    <div className="w-full flex flex-col items-center px-5 py-8 space-y-8">
      <div className="w-full">
        <SidebarMobile {...sidebar} />
      </div>
      {children}
    </div>
  )
}

export async function CategoryLayout({ children }: CategoryLayoutProps) {
  const categories = await getFaqCategories({ sort: ['id'] })
  const sidebarEntries = categories.map((category) => {
    return {
      name: category.name,
      slug: category.slug,
      url: `/faq/${category.slug}`,
    }
  })

  const sidebar = {
    entries: sidebarEntries,
    param: 'category-slug',
  }

  return (
    <>
      <div className="md:block hidden w-full pl-[calc(100vw-100%)] h-full">
        <CategoryLayoutDesktop sidebar={sidebar}>
          {children}
        </CategoryLayoutDesktop>
      </div>
      <div className="w-full md:hidden block">
        <CategoryLayoutMobile sidebar={sidebar}>
          {children}
        </CategoryLayoutMobile>
      </div>
    </>
  )
}
