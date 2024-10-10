export type IRouterFunctionSelector =
  | 'swapExactETHForTokens(uint256,address[],address,uint256)'
  | 'swapETHForExactTokens(uint256,address[],address,uint256)'
  | 'swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)'
  | 'swapExactTokensForETH(uint256,uint256,address[],address,uint256)'
  | 'swapTokensForExactETH(uint256,uint256,address[],address,uint256)'
  | 'swapExactTokensForETHSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)'
  | 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)'
  | 'swapTokensForExactTokens(uint256,uint256,address[],address,uint256)'
  | 'swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)'

export type IRouterLiquidityFunctionSelector =
  | 'addLiquidityETH(address,uint256,uint256,uint256,address,uint256)'
  | 'addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)'

export type IRouterRemoveLiquidityFunctionSelector =
  | 'removeLiquidityETH(address,uint256,uint256,uint256,address,uint256)'
  | 'removeLiquidityETHSupportingFeeOnTransferTokens(address,uint256,uint256,uint256,address,uint256)'
  | 'removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)'
