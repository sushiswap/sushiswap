import {
  FC,
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { FromBottom } from './FromBottom'
import { FromLeft } from './FromLeft'
import { FromRight } from './FromRight'
import { FromTop } from './FromTop'

interface RootProps {
  children: ReactElement | ReactElement[]
}

const SlideInContext = createContext<HTMLElement | null | undefined>(undefined)

export const Root: FC<RootProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [render, setRender] = useState(false)

  useEffect(() => {
    if (ref.current) setRender(true)
  }, [])

  return (
    <SlideInContext.Provider value={ref?.current}>
      {render && children}
      <div ref={ref} />
    </SlideInContext.Provider>
  )
}

export const useSlideInContext = () => {
  return useContext(SlideInContext)
}

/**
 * @deprecated
 */
export const SlideIn: FC<RootProps> & {
  FromLeft: FC<FromLeft>
  FromRight: FC<FromRight>
  FromBottom: FC<FromBottom>
  FromTop: FC<FromTop>
} = Object.assign(Root, {
  FromLeft: FromLeft,
  FromRight: FromRight,
  FromBottom: FromBottom,
  FromTop: FromTop,
})
