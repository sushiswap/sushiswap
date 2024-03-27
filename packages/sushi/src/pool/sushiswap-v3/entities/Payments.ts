import { Interface } from '@ethersproject/abi'
import IPeripheryPaymentsWithFee from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IPeripheryPaymentsWithFee.sol/IPeripheryPaymentsWithFee.json'
import { toHex } from '../../../convert/index.js'
import { Token } from '../../../currency/index.js'
import { Percent } from '../../../math/index.js'
import { validateAndParseAddress } from '../utils/index.js'

export interface FeeOptions {
  /**
   * The percent of the output that will be taken as a fee.
   */
  fee: Percent

  /**
   * The recipient of the fee.
   */
  recipient: string
}

export abstract class Payments {
  public static INTERFACE: Interface = new Interface(
    IPeripheryPaymentsWithFee.abi,
  )

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  private static encodeFeeBips(fee: Percent): string {
    return toHex(fee.multiply(10_000).quotient)
  }

  public static encodeUnwrapWETH9(
    amountMinimum: bigint,
    recipient: string,
    feeOptions?: FeeOptions,
  ): string {
    recipient = validateAndParseAddress(recipient)

    if (feeOptions) {
      const feeBips = this.encodeFeeBips(feeOptions.fee)
      const feeRecipient: string = validateAndParseAddress(feeOptions.recipient)

      return Payments.INTERFACE.encodeFunctionData('unwrapWETH9WithFee', [
        toHex(amountMinimum),
        recipient,
        feeBips,
        feeRecipient,
      ])
    } else {
      return Payments.INTERFACE.encodeFunctionData('unwrapWETH9', [
        toHex(amountMinimum),
        recipient,
      ])
    }
  }

  public static encodeSweepToken(
    token: Token,
    amountMinimum: bigint,
    recipient: string,
    feeOptions?: FeeOptions,
  ): string {
    recipient = validateAndParseAddress(recipient)

    if (feeOptions) {
      const feeBips = this.encodeFeeBips(feeOptions.fee)
      const feeRecipient: string = validateAndParseAddress(feeOptions.recipient)

      return Payments.INTERFACE.encodeFunctionData('sweepTokenWithFee', [
        token.address,
        toHex(amountMinimum),
        recipient,
        feeBips,
        feeRecipient,
      ])
    } else {
      return Payments.INTERFACE.encodeFunctionData('sweepToken', [
        token.address,
        toHex(amountMinimum),
        recipient,
      ])
    }
  }

  public static encodeRefundETH(): string {
    return Payments.INTERFACE.encodeFunctionData('refundETH')
  }
}
