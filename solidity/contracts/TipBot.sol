// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TipBot is AccessControlEnumerable, ReentrancyGuard {
  using ECDSA for bytes32;
  using Address for address;

  // Start of events declaration
  event Tip ( address indexed from,  address indexed toAddress, uint256 amount );
  event AirDrop ( address indexed from, address indexed toAddress, uint256 amount);
  event Withdraw ( uint256 amount, bytes32 indexed reason);

  // Global variables used in contract
  uint256 public feeRate = 0.1 ether;
  uint256 public airdropRate = 0.2 ether;

  mapping( address => mapping(bytes32 => bool)) signatureLookup;

  constructor(){
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function setFeeRate( uint256 _feeRate ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require( _feeRate < 1 ether, "Invalid amount, cannot be greater than 1 ether");
    feeRate = _feeRate;
  }

  function setAirdropRate( uint256 _feeRate ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require( _feeRate < 1 ether, "Invalid amount, cannot be greater than 1 ether");
    airdropRate = _feeRate;
  }

  function tip( address payable toAddress ) public payable nonReentrant {

    uint256 newBalance = ((1 ether - feeRate) * msg.value)/1 ether;
    (bool success, ) = toAddress.call{value: newBalance }("");
    require(success, "Failed to send Token");

    emit Tip( 
      msg.sender,
      toAddress,
      newBalance
    );
  }


  function airDrop ( 
    address payable[] memory accountAddress
  ) public payable nonReentrant {

    require(accountAddress.length > 0, "Addresses cannot be empty");
    uint256 distributedAmount = ( ((1 ether - airdropRate) * msg.value ) / 1 ether ) / accountAddress.length;

    for(uint8 i = 0; i < accountAddress.length; i++){

    (bool success, ) = accountAddress[i].call{value: distributedAmount }("");
    require(success, "Failed to send Token");

      emit AirDrop(
        msg.sender,
        accountAddress[i],
        distributedAmount
      );
    }
  }

  function withdraw (
    uint256 amount, 
    bytes memory data,
    bytes[] calldata signatures,
    bytes32 reason
  ) public nonReentrant {

    require( getRoleMemberCount(DEFAULT_ADMIN_ROLE) == signatures.length, "Not enough signatures");

    // Extract and verify each signature is valid
    bytes32 message = keccak256(data);
    bytes32 hashed = message.toEthSignedMessageHash();

    uint8 validSignatures = 0;
    for (uint8 i = 0; i < signatures.length; i++) {
        bytes calldata signature = signatures[i];
        (address signer) = hashed.recover(signature);

        require( !signatureLookup[signer][reason], "Repeating admin signature not valid");

        if (hasRole(DEFAULT_ADMIN_ROLE, signer) && !signatureLookup[signer][reason]) {
            validSignatures += 1;
            signatureLookup[signer][reason] = true;
        }
    }
    require( validSignatures == getRoleMemberCount(DEFAULT_ADMIN_ROLE), "Not all signatures are valid");
    
    //Perform withdraw action
    uint contractAmount = address(this).balance;
    require( amount <= contractAmount, "Not enough balance to withdraw" );

    uint256 distributedAmount =  amount / getRoleMemberCount(DEFAULT_ADMIN_ROLE);

    for(uint8 i = 0; i < getRoleMemberCount(DEFAULT_ADMIN_ROLE); i++){
      (bool success, ) = getRoleMember(DEFAULT_ADMIN_ROLE, i).call{value: distributedAmount }("");
      require( success, "Failed to withdraw" );
    }

    emit Withdraw(
      distributedAmount, 
      reason
    );
  }

}
