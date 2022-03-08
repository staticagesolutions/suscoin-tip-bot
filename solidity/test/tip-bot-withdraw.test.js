const { assert } = require("console");
const truffleAssertions = require("truffle-assertions");
const TipBot = artifacts.require("TipBot");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const fs = require('fs');
const ethers = require('ethers');

contract("TipBot Withdraw", (accounts)=>{
    const [ admin1, admin2, user1, user2, user3, user4 ] = accounts;
    const administrator1 = web3.eth.accounts.create();
    const administrator2 = web3.eth.accounts.create();

    before( async ()=>{
        tipbot = await TipBot.deployed();
        const adminRole = await tipbot.DEFAULT_ADMIN_ROLE();
        tipbot.grantRole(web3.utils.fromAscii("DEFAULT_ADMIN_ROLE"), admin1);
        tipbot.grantRole(adminRole, administrator1.address);
        tipbot.grantRole(adminRole, administrator2.address);
        tipbot.revokeRole(adminRole, admin1)

    }); 

    it("Should not allow to withdraw invalid hashed amount", async() => {

        const withdrawAmount = 2;
        const message_memo = "initialTesting";

        const encoded = web3.eth.abi.encodeParameter(
            {
              ParentStruct: {
                propertyOne: "uint256", // amount
                propertyTwo: "bytes32" // reason
              },
            },
            {
              propertyOne: 2000, //ERROR here invalid amount
              propertyTwo: web3.utils.rightPad(web3.utils.asciiToHex(message_memo), 64)
            }
          );
        
        const hashed = web3.utils.sha3(encoded);

        const signatures = [ 
            administrator1.sign(hashed).signature,
            administrator2.sign(hashed).signature,
        ];

        await expectRevert( 
            tipbot.withdraw( withdrawAmount.toString(), web3.utils.asciiToHex(message_memo), encoded, signatures ),
            'Hashed amount not valid'
        );
    });

    it("Should not allow to withdraw invalid hashed reason", async() => {

        const withdrawAmount = 2;
        const message_memo = "initialTesting";

        const encoded = web3.eth.abi.encodeParameter(
            {
              ParentStruct: {
                propertyOne: "uint256", // amount
                propertyTwo: "bytes32" // reason
              },
            },
            {
              propertyOne: withdrawAmount, //ERROR here invalid amount
              propertyTwo: web3.utils.rightPad(web3.utils.asciiToHex(message_memo), 64)
            }
          );
        
        const hashed = web3.utils.sha3(encoded);

        const signatures = [ 
            administrator1.sign(hashed).signature,
            administrator2.sign(hashed).signature,
        ];

        await expectRevert( 
            tipbot.withdraw( withdrawAmount.toString(), web3.utils.asciiToHex("invalid_message"), encoded, signatures ),
            'Hashed reason not valid'
        );
    });

    it("Should not allow to withdraw when there is not enough balance ", async() => {

        const withdrawAmount = 2;
        const message_memo = "initialTesting";

        const encoded = web3.eth.abi.encodeParameter(
            {
              ParentStruct: {
                propertyOne: "uint256", // amount
                propertyTwo: "bytes32" // reason
              },
            },
            {
              propertyOne: withdrawAmount, 
              propertyTwo: web3.utils.rightPad(web3.utils.asciiToHex(message_memo), 64)
            }
          );
        
        const hashed = web3.utils.sha3(encoded);

        const signatures = [ 
            administrator1.sign(hashed).signature,
            administrator2.sign(hashed).signature,
        ];

        await expectRevert( 
            tipbot.withdraw( withdrawAmount.toString(), web3.utils.asciiToHex(message_memo), encoded, signatures ),
            'Not enough balance to withdraw'
        );
    });

    it("Should not allow to withdraw when there are repeating signatures", async() => {

        const withdrawAmount = 2;
        const message_memo = "initialTesting";

        const encoded = web3.eth.abi.encodeParameter(
            {
              ParentStruct: {
                propertyOne: "uint256", // amount
                propertyTwo: "bytes32" // reason
              },
            },
            {
              propertyOne: withdrawAmount,
              propertyTwo: web3.utils.rightPad(web3.utils.asciiToHex(message_memo), 64)
            }
          );
        
        const hashed = web3.utils.sha3(encoded);

        const signatures = [ 
            administrator1.sign(hashed).signature,
            administrator1.sign(hashed).signature,
        ];

        await expectRevert( 
            tipbot.withdraw( withdrawAmount.toString(), web3.utils.asciiToHex('initialTest'), encoded, signatures ),
            'Repeating admin signature not valid'
        );
    });

    it("Should be able to withdraw successfully", async() => {

        const transferValue = 50;
        const feeRate = await tipbot.feeRate();
        const feeRateEth = await web3.utils.fromWei(feeRate);
        const newValue = ((1 - parseFloat(feeRateEth)) * transferValue) / 1;
        console.log('newValue = ' + newValue);

        // Trigger smart contract action
        const tippingEvent = await tipbot.tip(administrator1.address,{from: admin1, value: web3.utils.toWei( transferValue.toString() )});

        const withdrawAmount = 2;
        const message_memo = "initialTesting";

        const encoded = web3.eth.abi.encodeParameter(
            {
              ParentStruct: {
                propertyOne: "uint256", // amount
                propertyTwo: "bytes32" // reason
              },
            },
            {
              propertyOne: withdrawAmount,
              propertyTwo: web3.utils.rightPad(web3.utils.asciiToHex(message_memo), 64)
            }
          );
        
        const hashed = web3.utils.sha3(encoded);

        const signatures = [ 
            administrator1.sign(hashed).signature,
            administrator2.sign(hashed).signature,
        ];

        const withdrawEvent = await tipbot.withdraw( withdrawAmount.toString(), web3.utils.asciiToHex(message_memo), encoded, signatures );

        expectEvent( withdrawEvent, 'Withdraw', {
            amount: web3.utils.fromWei('1000000000000000000'),
            reason: web3.utils.rightPad(web3.utils.asciiToHex(message_memo), 64)
        });
    });
}); 