import { IS_TESTNET } from './is-testnet'

export const FACTORY_CONTRACT = IS_TESTNET
  ? ''
  : 'TPA5vJu579Ub5BRXETiEYZUs1SmGh7cDia' //sun.io factory contract address
export const ROUTER_CONTRACT = IS_TESTNET
  ? ''
  : 'TG61TbGhkx757ATfceRbnSHD3kHzQ7tk97' //sun.io router contract address
export const MULTICALL_CONTRACT = IS_TESTNET
  ? ''
  : 'TGXuuKAb4bnrn137u39EKbYzKNXvdCes98'
