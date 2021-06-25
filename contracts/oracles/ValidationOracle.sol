// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@boringcrypto/boring-solidity/contracts/libraries/BoringMath.sol";
import "../libraries/FixedPoint.sol";
import "../uniswapv2/interfaces/IUniswapV2Pair.sol";

contract ValidationOracle {
    using FixedPoint for *;
    using BoringMath for uint256;

    uint256 private constant PERIOD = 5;
    uint256 private constant VALIDITY = 60;
    uint256 private constant MAX_DIFFERENCE = 5e4;
    uint256 private constant PRECISION = 1e5;

    struct priceDataType {
        uint144 price0Last;
        uint32 lastBlock;
    }

    mapping(IUniswapV2Pair => priceDataType) priceData;

    function isWithinBounds(IUniswapV2Pair pair) external view returns (bool){
        priceDataType memory pairData = priceData[pair];
        uint256 differenceToLast = block.number - pairData.lastBlock;
        require(differenceToLast > PERIOD && differenceToLast <= VALIDITY, "Oracle out of date");
        uint256 currentPrice0 = FixedPoint.uq112x112(uint224(pair.price0CumulativeLast() / uint32(block.timestamp))).mul(1e18).decode144();
        uint256 divided = currentPrice0.mul(PRECISION) / pairData.price0Last;
        require(divided > PRECISION.sub(MAX_DIFFERENCE) && divided < PRECISION.add(MAX_DIFFERENCE), "Price out of boundary");
        return true;
    }

    function updatePairs(IUniswapV2Pair[] calldata pairs) external {
        for(uint256 i = 0; i < pairs.length; i++){
            uint256 differenceToLast = block.number - priceData[pairs[i]].lastBlock;
            if(differenceToLast > VALIDITY) {
                priceData[pairs[i]].price0Last = FixedPoint.uq112x112(uint224(pairs[i].price0CumulativeLast() / uint32(block.timestamp))).mul(1e18).decode144();
                priceData[pairs[i]].lastBlock = uint32(block.number);
            }
        }
    }
}