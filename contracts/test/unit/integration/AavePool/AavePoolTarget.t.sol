// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestHelper} from "../../../utils/TestHelper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {GelatoOneBalanceTarget} from "../../../../integration/GelatoOnebalance/GelatoOnebalanceTarget.sol";
import {AavePoolTarget} from "../../../../integration/AavePool/AavePoolTarget.sol";

contract AavePoolTest is AavePoolTarget {
  constructor(address _connext, address _aavePool) AavePoolTarget(_connext, _aavePool) {}

  function forwardFunctionCall(
    bytes memory _preparedData,
    bytes32 _transferId,
    uint256 _amount,
    address _asset
  ) public returns (bool) {
    return _forwardFunctionCall(_preparedData, _transferId, _amount, _asset);
  }
}

contract AavePoolTargetTest is TestHelper {
  // ============ Errors ============
  // error ProposedOwnable__onlyOwner_notOwner();

  // ============ Storage ============
  address private connext = address(1);
  address private aavePool = address(2);
  address public notOriginSender = address(bytes20(keccak256("NotOriginSender")));
  address private asset = address(4);

  AavePoolTest private target;
  bytes32 public transferId = keccak256("12345");
  uint32 public amount = 10;

  function setUp() public override {
    super.setUp();
    target = new AavePoolTest(MOCK_CONNEXT, aavePool);

    vm.label(address(this), "TestContract");
    vm.label(address(target), "AavePoolTarget");
  }

  function test__AavePoolTargetTest__forwardCall_works(uint256 _amountOut) public {
    vm.prank(address(target));
    uint256 amountOut = 9;
    address asset = address(4);
    address onBehalfOf = address(5);
    uint16 referralCode = 0;

    bytes memory forwardCallData = abi.encode(asset, amountOut, onBehalfOf, referralCode);
    bytes memory _preparedData = abi.encode(forwardCallData, amountOut, address(0), address(0));
    vm.mockCall(asset, abi.encodeWithSelector(IERC20.approve.selector), abi.encode(true));
    vm.mockCall(aavePool, abi.encodeWithSignature("supply(address,uint256,address,uint16)"), abi.encode(10));

    bool ret = target.forwardFunctionCall(_preparedData, transferId, amount, notOriginSender);
    assertEq(ret, true);
  }
}
