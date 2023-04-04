// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IDSA} from "../../../contracts/integration/Instadapp/interfaces/IDSA.sol";
import {TestHelper} from "../../utils/TestHelper.sol";
import {InstadappAdapter} from "../../../contracts/integration/Instadapp/InstadappAdapter.sol";

contract MockInstadappReceiver is InstadappAdapter {
  constructor() {}

  function testAuthCast(address dsaAddress, address auth, bytes memory signature, CastData memory castData) public {
    authCast(dsaAddress, auth, signature, castData);
  }

  function testVerify(address auth, bytes memory signature, CastData memory castData) public view returns (bool) {
    verify(auth, signature, castData);
  }
}

contract InstadappAdapterTest is TestHelper {
  // ============ Storage ============
  address dsa = address(1);
  MockInstadappReceiver instadappReceiver;

  // ============ Test set up ============
  function setUp() public override {
    super.setUp();

    instadappReceiver = new MockInstadappReceiver();
  }

  // ============ Utils ============
  function utils_dsaMocks(bool isAuth) public {
    vm.mockCall(dsa, abi.encodeWithSelector(IDSA.isAuth.selector), abi.encode(isAuth));
  }

  // ============ InstadappAdapter.authCast ============
  function test_InstadappAdapter__authCast_shouldRevertIfInvalidAuth() public {
    utils_dsaMocks(false);

    address originSender = address(0x123);

    string[] memory _targetNames = new string[](2);
    _targetNames[0] = "target1";
    _targetNames[1] = "target2";
    bytes[] memory _datas = new bytes[](2);
    _datas[0] = bytes("data1");
    _datas[1] = bytes("data2");
    address _origin = originSender;

    InstadappAdapter.CastData memory castData = InstadappAdapter.CastData(_targetNames, _datas, _origin);

    bytes memory signature = bytes("0x111");
    address auth = originSender;

    vm.expectRevert(bytes("Invalid Auth"));
    instadappReceiver.testAuthCast(dsa, auth, signature, castData);
  }

  function test_InstadappAdapter__authCast_shouldRevertIfInvalidSignature() public {
    utils_dsaMocks(true);

    address originSender = address(0x123);

    string[] memory _targetNames = new string[](2);
    _targetNames[0] = "target1";
    _targetNames[1] = "target2";
    bytes[] memory _datas = new bytes[](2);
    _datas[0] = bytes("data1");
    _datas[1] = bytes("data2");
    address _origin = originSender;

    InstadappAdapter.CastData memory castData = InstadappAdapter.CastData(_targetNames, _datas, _origin);

    bytes memory signature = bytes("0x111");
    address auth = originSender;

    vm.expectRevert(bytes("Invalid signature"));
    instadappReceiver.testAuthCast(dsa, auth, signature, castData);
  }

  function test_InstadappAdapter__authCast_shouldWork() public {}

  // ============ InstadappAdapter.verify ============
  function test_InstadappAdapter__verify_shouldReturnTrue() public {}

  function test_InstadappAdapter__verify_shouldReturnFalse() public {}
}
