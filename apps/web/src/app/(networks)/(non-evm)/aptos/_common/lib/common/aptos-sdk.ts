import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

export class AptosSDK {
  private static instances: { [key in Network]?: Aptos } = {}

  static onNetwork(network: Network): Aptos {
    if (!this.instances[network]) {
      this.instances[network] = new Aptos(
        new AptosConfig({
          network,
        }),
      )
    }
    return this.instances[network]!
  }
}
