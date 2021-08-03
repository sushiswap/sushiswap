// SPDX-License-Identifier: GPLV3

// P1 - P3: OK
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "./libraries/SafeMath.sol";

import "./uniswapv2/interfaces/IUniswapV2ERC20.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import './uniswapv2/libraries/UniswapV2Library.sol';
import './uniswapv2/libraries/TransferHelper.sol';
import "@boringcrypto/boring-solidity/contracts/BoringOwnable.sol";
import "@boringcrypto/boring-solidity/contracts/BoringBatchable.sol";
import "@boringcrypto/boring-solidity/contracts/libraries/BoringERC20.sol";


// SushiMaker is MasterChef's left hand and kinda a wizard. He can cook up Sushi from pretty much anything!
// This contract handles "serving up" rewards for xSushi holders by trading tokens collected from fees for Sushi.

// T1 - T4: OK
contract SushiMaker is BoringOwnable, BoringBatchable {
    using SafeMath for uint256;
    using BoringERC20 for IERC20;

    // V1 - V5: OK
    address public immutable factory;
    //0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac
    // V1 - V5: OK
    address public immutable bar;
    //0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272
    // V1 - V5: OK
    address private immutable sushi;
    //0x6B3595068778DD592e39A122f4f5a5cF09C90fE2

    mapping(address => bool) public isOperator;

    
    event LogSushiTransfer(uint256 amountSushi);

    event LogConvert(
        address indexed server,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1
    );

    constructor(
        address _factory,
        address _bar,
        address _sushi
    ) public {
        factory = _factory;
        bar = _bar;
        sushi = _sushi;
    }

    modifier onlyOperator {
        require(
            isOperator[msg.sender],
            "Only operator can call this function."
        );
        _;
    }

    function setOperator(address user, bool status) external onlyOwner {
        isOperator[user] = status;
    }

    function transferSushi(uint256 amount) public {
        IERC20(sushi).safeTransfer(bar, amount);
        emit LogSushiTransfer(amount);
    }

     // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path
    ) public onlyOperator returns (uint[] memory amounts) {
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        IERC20(path[0]).safeTransfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        emit LogConvert(
            msg.sender,
            path[0],
            path[path.length - 1],
            amountIn,
            amounts[amounts.length - 1]
        );
    }

    function burnPair(IUniswapV2Pair pair) public onlyOperator {
        pair.burn(address(this));
    } 
}
