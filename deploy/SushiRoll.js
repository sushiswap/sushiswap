const UNISWAP_ROUTER = new Map()
UNISWAP_ROUTER.set("1", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
UNISWAP_ROUTER.set("3", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
UNISWAP_ROUTER.set("4", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
UNISWAP_ROUTER.set("5", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
UNISWAP_ROUTER.set("42", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
UNISWAP_ROUTER.set("1287", "0x2823caf546C7d09a4832bd1da14f2C6b6E665e05")
UNISWAP_ROUTER.set("31337", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
UNISWAP_ROUTER.set("79377087078960", "0x0B72c0193CD598b536210299d358A5b720A262b8")

module.exports = async function ({ getNamedAccounts, getChainId, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const chainId = await getChainId()

  if (!UNISWAP_ROUTER.has(chainId)) {
    throw Error("No Uniswap Router")
  }

  const uniswapRouterAddress = UNISWAP_ROUTER.get(chainId)

  const sushiswapRouterAddress = (await deployments.get("UniswapV2Router02")).address

  await deploy("SushiRoll", {
    from: deployer,
    args: [uniswapRouterAddress, sushiswapRouterAddress],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["SushiRoll"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02"]
