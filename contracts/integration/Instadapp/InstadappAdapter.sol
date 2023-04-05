// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IDSA} from "./interfaces/IDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract InstadappAdapter is EIP712 {
  struct CastData {
    string[] _targetNames;
    bytes[] _datas;
    address _origin;
  }

  mapping(address => uint256) public nonces;

  // Instadapp contract on this domain
  bytes32 public constant CASTDATA_TYPEHASH =
    keccak256("CastData(string[] _targetNames,bytes[] _datas,address _origin),uint256 nonce");

  constructor() EIP712("InstaTargetAuth", "1") {}

  /// Internal functions
  function authCast(address dsaAddress, address auth, bytes memory signature, CastData memory castData) internal {
    IDSA dsa = IDSA(dsaAddress);
    require(dsa.isAuth(auth), "Invalid Auth");
    require(verify(auth, signature, castData), "Invalid signature");
    // increment nonce
    nonces[auth]++;
    // send funds to DSA
    dsa.cast{value: msg.value}(castData._targetNames, castData._datas, castData._origin);
  }

  function verify(address auth, bytes memory signature, CastData memory castData) internal view returns (bool) {
    bytes32 digest = _hashTypedDataV4(
      keccak256(abi.encode(CASTDATA_TYPEHASH, castData._targetNames, castData._datas, castData._origin, nonces[auth]))
    );
    address signer = ECDSA.recover(digest, signature);
    return signer == auth;
  }
}
