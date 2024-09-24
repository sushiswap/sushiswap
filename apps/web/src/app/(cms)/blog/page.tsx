import { Container } from '@sushiswap/ui'
import { Suspense } from 'react'
import { ArticleList } from './components/article-list/article-list'
import { BlogSearchProvider } from './components/blog-search-provider'
import { CategoryFilter } from './components/category-filter/category-filter'
import { Hero } from './components/hero'
import { SearchFilter } from './components/search-filter'

export const fetchCache = 'default-no-store'

export default function Page() {
  return (
    <Suspense>
      <BlogSearchProvider>
        <Hero />
        <div className="h-[0.5px] bg-accent w-full" />
        <Container
          className="z-10 px-4 md:pb-20 py-4 mx-auto space-y-12"
          maxWidth="5xl"
        >
          <div className="flex justify-between gap-4 items-start md:flex-row flex-col-reverse">
            <div className="w-full">
              <CategoryFilter />
            </div>
            <div className="md:w-[400px] md:max-w-[1/4] w-full">
              <SearchFilter />
            </div>
          </div>
          <ArticleList />
        </Container>
      </BlogSearchProvider>
    </Suspense>
  )
}
