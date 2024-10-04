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
    <Container maxWidth="4xl" className="pb-40 pt-24 px-8 space-y-8">
      {/* <div className="font-bold">Categories</div> */}
      <div className="flex justify-between space-x-20">
        <SidebarDesktop {...sidebar} />
        <div className="min-h-full flex dark:bg-slate-600 bg-[#BFBFBF] w-[2px]" />
        {children}
      </div>
    </Container>
  )
}

function CategoryLayoutMobile({
  children,
  sidebar,
}: { children: React.ReactNode; sidebar: Sidebar }) {
  return (
    <div className="w-full flex flex-col items-center px-5 pt-8 space-y-8">
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
      <div className="md:block hidden w-full">
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
