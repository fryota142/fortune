pragma solidity ^0.5.0;

contract Fortune {
  bytes32 random;

  function rand(bytes32 _seed) public returns (bytes32) {
    random = keccak256(abi.encodePacked(_seed, "abc"));

    return random;
  }

  function getRandom() public view returns (bytes32) {
    return random;
  }
}