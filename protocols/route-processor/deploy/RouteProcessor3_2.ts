import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  run,
  getChainId,
}: HardhatRuntimeEnvironment) => {
  const { BENTOBOX_ADDRESS, isBentoBoxChainId } = await import('sushi/config')
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = await getChainId()

  const args = [
    isBentoBoxChainId(chainId)
      ? BENTOBOX_ADDRESS[chainId]
      : '0x0000000000000000000000000000000000000000',
    [],
  ]

  const { address } = await deploy('RouteProcessor3_2', {
    from: deployer,
    args,
    waitConfirmations: 16,
  })

  console.log(`RouteProcessor3_2 deployed to ${address}`)

  await run('verify:verify', {
    address,
    constructorArguments: args,
  })

  console.log('RouteProcessor3_2 verified')
}

func.tags = ['RouteProcessor3_2']

export default func
