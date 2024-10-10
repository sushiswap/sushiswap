export const testnet = {
  name: 'Sushi Default Aptos List',
  timestamp: '2022-01-26T11:45:09Z',
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  tags: {},
  logoURI:
    'https://cdn.sushi.com/image/upload/f_auto,c_limit,w_64,q_auto/tokens/137/0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a.jpg',
  keywords: ['sushi', 'default', 'aptos'],
  schema: 'aptos',
  tokens: [
    {
      name: 'APTOS',
      symbol: 'APT',
      decimals: 8,
      address: '0x1::aptos_coin::AptosCoin',
      logoURI:
        'https://cryptototem.com/wp-content/uploads/2022/08/aptos-logo.jpg',
    },
    {
      name: 'Sushi',
      symbol: 'SUSHI',
      decimals: 8,
      address:
        '0x924a3288570e688396c01950420b298ca90c1ad98835299efb5bb6c6220303f::sushi_coin::Sushi',
      logoURI:
        'https://cdn.sushi.com/image/upload/f_auto,c_limit,w_64,q_auto/tokens/137/0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a.jpg',
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
      address:
        '0xb06483aa110a1d7cfdc0f5ba48545ee967564819014326b2767de4705048aab9::btc_coin::Bitcoin',
      logoURI:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/2048px-Bitcoin.svg.png',
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 8,
      address:
        '0xd2f34ece0b838b770eac6d23a1e139d28008c806af944f779728629867d17538::ether_coin::Ether',
      logoURI:
        'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Ethereum-ETH-icon.png',
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 8,
      address:
        '0xe05d610ddad41a45e61b1327f01fcc0a582eedae00683ef969b85fa892c4b4f::usdt::Tether',
      logoURI:
        'https://w7.pngwing.com/pngs/840/253/png-transparent-usdt-cryptocurrencies-icon-thumbnail.png',
    },
    {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 8,
      address:
        '0x5728d69f8a1c64b4cdb59f7746fe1a847215716e77c4bc90128c1100da826946::matic::Polygon',
      logoURI:
        'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/DPYBKVZG55EWFHIK2TVT3HTH7Y.png',
    },
  ],
} as const
