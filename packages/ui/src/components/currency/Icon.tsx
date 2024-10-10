import { ImageProps } from 'next/image'
import { FC } from 'react'
import { Chain, ChainId } from 'sushi/chain'
import { Currency } from 'sushi/currency'

import { Avatar, AvatarImage } from '../avatar'
import { LinkExternal } from '../link'

const AvaxLogo = 'avax.svg'
const BnbLogo = 'bnb.svg'
const EthereumLogo = 'ethereum.svg'
const FtmLogo = 'ftm.svg'
const OneLogo = 'one.svg'
const HtLogo = 'ht.svg'
const MaticLogo = 'matic.svg'
const GlmrLogo = 'glmr.svg'
const OktLogo = 'okt.svg'
const xDaiLogo = 'xdai.svg'
const CeloLogo = 'celo.svg'
const PalmLogo = 'plam.svg'
const MovrLogo = 'movr.svg'
const FuseLogo = 'fuse.svg'
const TelosLogo = 'telos.svg'
const KavaLogo = 'kava.svg'
const MetisLogo = 'metis.svg'
const BobaLogo = 'boba.svg'
const BttcLogo = 'bttc.svg'
const ThundercoreLogo = 'thundercore.svg'
const CoreLogo = 'core.svg'
const IslmLogo = 'islm.svg'
const FilecoinLogo = 'filecoin.svg'
const ZetaLogo = 'zeta.svg'
const CroLogo = 'cronos.svg'
const BitcoinLogo = 'bitcoin.svg'
const MntLogo = 'mntl.svg'

const LOGO: Record<number, string> = {
  [ChainId.ETHEREUM]: EthereumLogo,
  [ChainId.SEPOLIA]: EthereumLogo,
  // [ChainId.KOVAN]: EthereumLogo,
  // [ChainId.RINKEBY]: EthereumLogo,
  // [ChainId.ROPSTEN]: EthereumLogo,
  // [ChainId.GÖRLI]: EthereumLogo,
  [ChainId.FANTOM]: FtmLogo,
  [ChainId.FANTOM_TESTNET]: FtmLogo,
  [ChainId.POLYGON]: MaticLogo,
  [ChainId.POLYGON_TESTNET]: MaticLogo,
  [ChainId.GNOSIS]: xDaiLogo,
  [ChainId.BSC]: BnbLogo,
  [ChainId.BSC_TESTNET]: BnbLogo,
  [ChainId.AVALANCHE]: AvaxLogo,
  [ChainId.AVALANCHE_TESTNET]: AvaxLogo,
  [ChainId.HECO]: HtLogo,
  // [ChainId.HECO_TESTNET]: HtLogo,
  [ChainId.HARMONY]: OneLogo,
  // [ChainId.HARMONY_TESTNET]: OneLogo,
  [ChainId.OKEX]: OktLogo,
  // [ChainId.OKEX_TESTNET]: OktLogo,
  [ChainId.ARBITRUM]: EthereumLogo,
  [ChainId.ARBITRUM_TESTNET]: EthereumLogo,
  [ChainId.CELO]: CeloLogo,
  [ChainId.PALM]: PalmLogo,
  [ChainId.MOONRIVER]: MovrLogo,
  [ChainId.FUSE]: FuseLogo,
  [ChainId.TELOS]: TelosLogo,
  [ChainId.MOONBEAM]: GlmrLogo,
  [ChainId.OPTIMISM]: EthereumLogo,
  [ChainId.KAVA]: KavaLogo,
  [ChainId.ARBITRUM_NOVA]: EthereumLogo,
  [ChainId.METIS]: MetisLogo,
  [ChainId.BOBA]: EthereumLogo,
  [ChainId.BOBA_AVAX]: BobaLogo,
  [ChainId.BOBA_BNB]: BobaLogo,
  [ChainId.BTTC]: BttcLogo,
  [ChainId.POLYGON_ZKEVM]: EthereumLogo,
  [ChainId.THUNDERCORE]: ThundercoreLogo,
  [ChainId.CORE]: CoreLogo,
  [ChainId.HAQQ]: IslmLogo,
  [ChainId.ZKSYNC_ERA]: EthereumLogo,
  [ChainId.LINEA]: EthereumLogo,
  [ChainId.BASE]: EthereumLogo,
  [ChainId.SCROLL]: EthereumLogo,
  [ChainId.FILECOIN]: FilecoinLogo,
  [ChainId.ZETACHAIN]: ZetaLogo,
  [ChainId.CRONOS]: CroLogo,
  [ChainId.BLAST]: EthereumLogo,
  [ChainId.ROOTSTOCK]: BitcoinLogo,
  [ChainId.MANTLE]: MntLogo,
  [ChainId.MANTA]: EthereumLogo,
  [ChainId.MODE]: EthereumLogo,
  [ChainId.TAIKO]: EthereumLogo,
  [ChainId.ZKLINK]: EthereumLogo,
}

// function djb2(str: string) {
//   let hash = 5381
//   for (let i = 0; i < str.length; i++) {
//     hash = (hash << 5) + hash + str.charCodeAt(i) /* hash * 33 + c */
//   }
//   return hash
// }

// function hashStringToColor(str: string) {
//   const hash = djb2(str)
//   const r = (hash & 0xff0000) >> 16
//   const g = (hash & 0x00ff00) >> 8
//   const b = hash & 0x0000ff
//   return `#${`0${r.toString(16)}`.substr(-2)}${`0${g.toString(16)}`.substr(
//     -2,
//   )}${`0${b.toString(16)}`.substr(-2)}`
// }

export interface IconProps extends Omit<ImageProps, 'src' | 'alt'> {
  currency: Currency
  disableLink?: boolean
}

export const Icon: FC<IconProps> = ({
  currency,
  disableLink = true,
  ...rest
}) => {
  const src = currency.isNative
    ? `native-currency/${LOGO[currency.chainId]}`
    : `tokens/${currency.chainId}/${currency.wrapped.address}.jpg`

  const avatar = (
    <Avatar style={{ width: rest.width, height: rest.height }}>
      <AvatarImage width={Number(rest.width) ?? 20} src={src} />
      {/* <AvatarFallback
        style={{
          background: hashStringToColor(
            `${currency.symbol} ${currency.name}` ?? '??',
          ),
        }}
        className="text-white"
      >
        {currency.symbol?.substring(0, 2)}
      </AvatarFallback> */}
    </Avatar>
  )

  if (disableLink) {
    return avatar
  }

  return (
    <LinkExternal
      href={Chain.tokenUrl(currency.chainId, currency.wrapped.address)}
    >
      {avatar}
    </LinkExternal>
  )
}
