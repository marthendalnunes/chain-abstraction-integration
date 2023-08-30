// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {AavePoolAdapter} from "./AavePoolAdapter.sol";
import {SwapForwarderXReceiver} from "../../destination/xreceivers/Swap/SwapForwarderXReceiver.sol";
import "hardhat/console.sol";

contract AavePoolTarget is AavePoolAdapter, SwapForwarderXReceiver {
  constructor(address _connext, address _aavePool) SwapForwarderXReceiver(_connext) AavePoolAdapter(_aavePool) {}

  function _forwardFunctionCall(
    bytes memory _preparedData,
    bytes32 /*_transferId*/,
    uint256 /*_amount*/,
    address /*_asset*/
  ) internal override returns (bool) {
    (bytes memory _forwardCallData, uint256 _amountOut, , ) = abi.decode(
      _preparedData,
      (bytes, uint256, address, address)
    );
    (address _asset, address _onBehalfOf, uint16 _referralCode) = abi.decode(
      _forwardCallData,
      (address, address, uint16)
    );

    _supply(_asset, _amountOut, _onBehalfOf, _referralCode);

    require(IERC20(_asset).balanceOf(address(this)) >= _amountOut, "AavePoolTarget: Balance not enough");
    return true;
  }
}
