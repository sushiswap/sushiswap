import { SwapProvider } from './swap-provider'

export async function Providers({ children }: { children: React.ReactNode }) {
  return <SwapProvider>{children}</SwapProvider>
}
