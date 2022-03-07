const { assert } = require("console");
const truffleAssertions = require("truffle-assertions");
const TipBot = artifacts.require("TipBot");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const fs = require('fs');
const ethers = require('ethers');

contract("TipBot", (accounts)=>{
    const [ admin1, admin2, user1, user2, user3, user4 ] = accounts;

    before( async ()=>{
        tipbot = await TipBot.deployed();
        tipbot.grantRole(web3.utils.fromAscii("DEFAULT_ADMIN_ROLE"), admin1);

    }); 

    it("Should have a feeRate of 0.1 eth", async () => {
        const feeRate = await tipbot.feeRate();
        const feeRateEth = await web3.utils.fromWei(feeRate);
        console.log(feeRateEth);
        expect(feeRateEth).to.be.equal('0.1');
    });

    it("Should have an airDropRate of 0.2 eth", async () => {
        const feeRate = await tipbot.airdropRate();
        const feeRateEth = await web3.utils.fromWei(feeRate);
        console.log(feeRateEth);
        expect(feeRateEth).to.be.equal('0.2');
    });


    it("Should be able to receive tip event from user1 to user2", async () => {

        // Set this as transfer value
        const transferValue = 1;
        const feeRate = await tipbot.feeRate();
        const feeRateEth = await web3.utils.fromWei(feeRate);

        // Trigger smart contract action
        const eventTip = await tipbot.tip(user2,{from: user1, value: web3.utils.toWei( transferValue.toString() )});

        const newValue = ((1 - parseFloat(feeRateEth)) * transferValue) / 1;

        expectEvent( eventTip, 'Tip', {
            from: user1,
            toAddress: user2,
            amount: web3.utils.toWei(newValue.toString())
        });
    });

    it("Should be able to do airDrop to multiple users user1, user2, user3", async () => {

        // Set this as transfer value
        const transferValue = 2;
        const airDropRate = await tipbot.airdropRate();
        const airDropRateEth = await web3.utils.fromWei(airDropRate);

        const airdrop_address = [user1, user2, user3, user4];
        const airDropEvent = await tipbot.airDrop(airdrop_address,{from: admin1, value: web3.utils.toWei(transferValue.toString())});

        //Compute for the distributed value
        const distributedValue = (((1 - parseFloat(airDropRateEth)) * transferValue) / 1) / airdrop_address.length;

        expectEvent( airDropEvent, 'AirDrop', {
            from: admin1,
            toAddress: user1,
            amount: web3.utils.toWei(distributedValue.toString())
        });

        expectEvent( airDropEvent, 'AirDrop', {
            from: admin1,
            toAddress: user2,
            amount: web3.utils.toWei(distributedValue.toString())
        });

        expectEvent( airDropEvent, 'AirDrop', {
            from: admin1,
            toAddress: user3,
            amount: web3.utils.toWei(distributedValue.toString())
        });

        expectEvent( airDropEvent, 'AirDrop', {
            from: admin1,
            toAddress: user4,
            amount: web3.utils.toWei(distributedValue.toString())
        });

    });

    it("Should be able change airDrop rate not greater than 1 eth", async() => {
        await tipbot.setAirdropRate( web3.utils.toWei('0.4'));
        const feeRate = await tipbot.airdropRate();
        const feeRateEth = await web3.utils.fromWei(feeRate);
        expect(feeRateEth).to.be.equal('0.4');
    });

    it("Should not be able to send more than account's balance", async() => {
        await expectRevert(
            tipbot.tip(user2,{from: user1, value: web3.utils.toWei('200')}),
            "sender doesn't have enough funds to send tx"
        );
    });
}); 

describe('TipBot Failing Test', ()=>{
    beforeEach(async function(){
        this.tipbot = await TipBot.deployed()
    });

    it("Should not be able change feerate not greater than 1 eth", async() => {
        await expectRevert(
            TipBot.deployed().then(function(tipbot){
                return tipbot.setFeeRate( web3.utils.toWei('1'));
            }), 'Invalid amount, cannot be greater than 1 ether'
        );
    });

    it("Should not be able change airdrop rate not greater than 1 eth", async() => {
        await expectRevert(
            TipBot.deployed().then(function(tipbot){
                return tipbot.setAirdropRate( web3.utils.toWei('1'));
            }), 'Invalid amount, cannot be greater than 1 ether'
        );
    });

    it("Should not be able change airdrop rate not greater than 1 eth", async() => {
        await expectRevert(
            TipBot.deployed().then(function(tipbot){
                return tipbot.setAirdropRate( web3.utils.toWei('1'));
            }), 'Invalid amount, cannot be greater than 1 ether'
        );
    });
});