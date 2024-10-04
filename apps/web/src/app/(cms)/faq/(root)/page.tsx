import { typographyVariants } from '@sushiswap/ui'
import { GetInTouch } from './components/get-in-touch'
import { HelpByCategories } from './components/help-by-categories'
import { HelpByProducts } from './components/help-by-products'
import { MostSearchedQuestions } from './components/most-searched-questions'
import { SearchBox } from './components/search-box'

export const revalidate = 3600

export default async function Page() {
  return (
    <div className="w-full flex items-center flex-col pb-40">
      <div className="w-full bg-[linear-gradient(104deg,rgba(9,147,236,0.20)0%,rgba(243,56,195,0.20)100%)] dark:bg-[linear-gradient(0deg,rgba(0,0,0,0.20)0%,rgba(0,0,0,0.20)100%),linear-gradient(104deg,rgba(9,147,236,0.20)0%,rgba(243,56,195,0.20)100%)] pt-12 md:pt-20 pb-[72px] md:pb-24">
        <div className="flex flex-col items-center space-y-8 md:space-y-16 p-5">
          <div className="space-y-4 flex flex-col items-center">
            <h1 className={typographyVariants({ variant: 'h1' })}>Sushi FAQ</h1>
            <div className="md:text-xl opacity-60 max-w-[720px] text-center">{`Everything you need to know about Sushi products in the form of an FAQ knowledge base.`}</div>
          </div>
          <GetInTouch />
        </div>
      </div>
      <div className="relative -translate-y-2/4 flex justify-center w-full">
        <div className="lg:w-1/3 md:w-2/5 w-11/12">
          <SearchBox />
        </div>
      </div>
      <div className="max-w-6xl lg:px-[120px] md:px-[80px] w-full px-5 space-y-12 md:space-y-28">
        <MostSearchedQuestions />
        <HelpByCategories />
        <HelpByProducts />
      </div>
    </div>
  )
}
