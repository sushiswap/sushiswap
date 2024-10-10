import { ChainId } from 'sushi/chain'

import { IconComponent } from '../../../types'
import { ArbitrumNaked } from './ArbitrumNaked'
import { ArbitrumNovaNaked } from './ArbitrumNovaNaked'
import { AvalancheNaked } from './AvalancheNaked'
import { BaseNaked } from './BaseNaked'
import { BinanceNaked } from './BinanceNaked'
import { BlastNaked } from './BlastNaked'
import { BobaAvaxNaked } from './BobaAvaxNaked'
import { BobaBNBNaked } from './BobaBNBNaked'
import { BobaNaked } from './BobaNaked'
import { BttcNaked } from './BttcNaked'
import { CeloNaked } from './CeloNaked'
import { CoreNaked } from './CoreNaked'
import { CronosNaked } from './CronosNaked'
import { EthereumNaked } from './EthereumNaked'
import { FantomNaked } from './FantomNaked'
import { FilecoinNaked } from './FilecoinNaked'
import { FuseNaked } from './FuseNaked'
import { GnosisNaked } from './GnosisNaked'
import { HaqqNaked } from './HaqqNaked'
import { HarmonyNaked } from './HarmonyNaked'
import { HecoNaked } from './HecoNaked'
import { KavaNaked } from './KavaNaked'
import { LineaNaked } from './LineaNaked'
import { MantaNaked } from './MantaNaked'
import { MantleNaked } from './MantleNaked'
import { MetisNaked } from './MetisNaked'
import { ModeNaked } from './ModeNaked'
import { MoonbeamNaked } from './MoonbeamNaked'
import { MoonriverNaked } from './MoonriverNaked'
import { OkexNaked } from './OkexNaked'
import { OptimismNaked } from './OptimismNaked'
import { PalmNaked } from './PalmNaked'
import { PolygonNaked } from './PolygonNaked'
import { PolygonZKNaked } from './PolygonZKNaked'
import { RootstockNaked } from './RootstockNaked'
import { ScrollNaked } from './ScrollNaked'
import { SkaleNaked } from './SkaleNaked'
import { TaikoNaked } from './TaikoNaked'
import { TelosNaked } from './TelosNaked'
import { ThunderCoreNaked } from './ThunderCoreNaked'
import { ZKLinkNaked } from './ZKLinkNaked'
import { ZKSyncNaked } from './ZKSyncNaked'
import { ZetaChainNaked } from './ZetaChainNaked'

export * from './ArbitrumNaked'
export * from './ArbitrumNovaNaked'
export * from './AvalancheNaked'
export * from './BaseNaked'
export * from './BinanceNaked'
export * from './BlastNaked'
export * from './BobaAvaxNaked'
export * from './BobaBNBNaked'
export * from './BobaNaked'
export * from './BttcNaked'
export * from './CeloNaked'
export * from './CoreNaked'
export * from './CronosNaked'
export * from './EthereumNaked'
export * from './FantomNaked'
export * from './FilecoinNaked'
export * from './FuseNaked'
export * from './GnosisNaked'
export * from './HaqqNaked'
export * from './HarmonyNaked'
export * from './HecoNaked'
export * from './KavaNaked'
export * from './LineaNaked'
export * from './MantaNaked'
export * from './MantleNaked'
export * from './MetisNaked'
export * from './ModeNaked'
export * from './MoonbeamNaked'
export * from './MoonriverNaked'
export * from './OkexNaked'
export * from './OptimismNaked'
export * from './PalmNaked'
export * from './PolygonNaked'
export * from './PolygonZKNaked'
export * from './RootstockNaked'
export * from './ScrollNaked'
export * from './SkaleNaked'
export * from './TaikoNaked'
export * from './TelosNaked'
export * from './TronNaked'
export * from './ZKLinkNaked'
export * from './ZKSyncNaked'
export * from './ZetaChainNaked'

export const NETWORK_NAKED_ICON: Partial<Record<ChainId, IconComponent>> = {
  [ChainId.ETHEREUM]: EthereumNaked,
  [ChainId.FANTOM]: FantomNaked,
  [ChainId.POLYGON]: PolygonNaked,
  [ChainId.GNOSIS]: GnosisNaked,
  [ChainId.BSC]: BinanceNaked,
  [ChainId.ARBITRUM]: ArbitrumNaked,
  [ChainId.AVALANCHE]: AvalancheNaked,
  [ChainId.HARMONY]: HarmonyNaked,
  [ChainId.CELO]: CeloNaked,
  [ChainId.MOONRIVER]: MoonriverNaked,
  [ChainId.FUSE]: FuseNaked,
  [ChainId.TELOS]: TelosNaked,
  [ChainId.MOONBEAM]: MoonbeamNaked,
  [ChainId.OPTIMISM]: OptimismNaked,
  [ChainId.KAVA]: KavaNaked,
  [ChainId.METIS]: MetisNaked,
  [ChainId.ARBITRUM_NOVA]: ArbitrumNovaNaked,
  [ChainId.HECO]: HecoNaked,
  [ChainId.OKEX]: OkexNaked,
  [ChainId.PALM]: PalmNaked,
  [ChainId.BOBA]: BobaNaked,
  [ChainId.BOBA_AVAX]: BobaAvaxNaked,
  [ChainId.BOBA_BNB]: BobaBNBNaked,
  [ChainId.BTTC]: BttcNaked,
  [ChainId.POLYGON_ZKEVM]: PolygonZKNaked,
  [ChainId.THUNDERCORE]: ThunderCoreNaked,
  [ChainId.HAQQ]: HaqqNaked,
  [ChainId.CORE]: CoreNaked,
  [ChainId.ZKSYNC_ERA]: ZKSyncNaked,
  [ChainId.LINEA]: LineaNaked,
  [ChainId.BASE]: BaseNaked,
  [ChainId.SCROLL]: ScrollNaked,
  [ChainId.FILECOIN]: FilecoinNaked,
  [ChainId.ZETACHAIN]: ZetaChainNaked,
  [ChainId.BLAST]: BlastNaked,
  [ChainId.SKALE_EUROPA]: SkaleNaked,
  [ChainId.ROOTSTOCK]: RootstockNaked,
  [ChainId.CRONOS]: CronosNaked,
  [ChainId.MANTLE]: MantleNaked,
  [ChainId.MANTA]: MantaNaked,
  [ChainId.MODE]: ModeNaked,
  [ChainId.TAIKO]: TaikoNaked,
  [ChainId.ZKLINK]: ZKLinkNaked,
}
