// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

abstract contract BridgeERC20 is ERC20Burnable {
  function mint( address account, uint256 amount ) public virtual;
}

contract TipBot is AccessControlEnumerable, ReentrancyGuard {
  using ECDSA for bytes32;
  using Address for address;

  // Start of events declaration
  event Tip ( address indexed from,  address indexed toAddress, uint256 amount );
  event AirDrop ( address[] indexed accounts);

  // Global variables used in contract
  uint256 public feeRate = 0.1 ether;
  uint256 public airdropRate = 0.2 ether;

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

    uint256 distributedAmount = ( ((1 ether - airdropRate) * msg.value ) / 1 ether ) / accountAddress.length;

    for(uint8 i = 0; i < accountAddress.length; i++){

      (bool success, ) = accountAddress[i].call{value: distributedAmount }("");
      require(success, "Failed to send Token");

      emit Tip( 
        msg.sender,
        accountAddress[i],
        distributedAmount
      );
    }
  }

  function withdraw (
    uint256 amount, 
    bytes memory data,
    bytes[] calldata signatures
  ) public nonReentrant {

    // require( getRoleMemberCount(DEFAULT_ADMIN_ROLE) == signatures.length, "Not enough signatures");

    // Extract and verify each signature is valid
    bytes32 message = keccak256(data);
    bytes32 hashed = message.toEthSignedMessageHash();

    uint8 validSignatures = 0;
    for (uint8 i = 0; i < signatures.length; i++) {
        bytes calldata signature = signatures[i];
        address signer = hashed.recover(signature);
        if (hasRole(DEFAULT_ADMIN_ROLE, signer)) {
            validSignatures += 1;
        }
    }
    require( validSignatures == getRoleMemberCount(DEFAULT_ADMIN_ROLE), "Not all signatures are valid");
    
    //Perform withdraw action
    uint contractAmount = address(this).balance;
    require( amount <= contractAmount, "Not enough balance to withdraw" );

    (bool success, ) =  msg.sender.call{ value: amount }("");
    require( success, "Failed to withdraw" );
  }

}
