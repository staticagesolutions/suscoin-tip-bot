const truffleAssertions = require("truffle-assertions");
const TipBot = artifacts.require("TipBot");

contract("TipBot", (accounts)=>{
    const [ admin1, admin2, user1, user2, user3, user4 ] = accounts;
    before( async ()=>{
        tipbot = await TipBot.deployed();
        tipbot.grantRole(web3.utils.fromAscii("DEFAULT_ADMIN_ROLE"), admin1);
        tipbot.grantRole(web3.utils.fromAscii("DEFAULT_ADMIN_ROLE"), admin2);
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

    it("Should be able change fee rate not greater than 1 eth", async() => {
        await tipbot.setFeeRate( web3.utils.toWei('0.2'));
        const feeRate = await tipbot.feeRate();
        const feeRateEth = await web3.utils.fromWei(feeRate);
        expect(feeRateEth).to.be.equal('0.2');
    });

    it("Should be able change airDrop rate not greater than 1 eth", async() => {
        await tipbot.setAirdropRate( web3.utils.toWei('0.4'));
        const feeRate = await tipbot.airdropRate();
        const feeRateEth = await web3.utils.fromWei(feeRate);
        expect(feeRateEth).to.be.equal('0.4');
    });

    it("Should be able to tip user1 to user2", async () => {

        let user1_initial_balance = await web3.eth.getBalance(user1);
        console.log(user1_initial_balance);
        let user2_initial_balance = await web3.eth.getBalance(user2);
        console.log(user2_initial_balance);

        const eventTip = tipbot.tip(user2,{from: user1, value: web3.utils.toWei('1')});
        user1_initial_balance = await web3.eth.getBalance(user1);
        user2_initial_balance = await web3.eth.getBalance(user2);
        console.log(await web3.utils.fromWei(user1_initial_balance));
        console.log(await web3.utils.fromWei(user2_initial_balance));

        // TODO: 
        // truffleAssertions.eventEmitted(
        //     eventTip,
        //     "Tip",
        //     ({ from, toAddress, amount}) => 
        //         from === user1 &&
        //         toAddress === user2 &&
        //         amount.toNumber() === 1
        // );

    });

    it("Should be able to do airDrop to multiple users user1, user2, user3", async () => {

        let user1_initial_balance = await web3.eth.getBalance(user1);
        console.log(user1_initial_balance);
        let user2_initial_balance = await web3.eth.getBalance(user2);
        console.log(user2_initial_balance);
        let user3_initial_balance = await web3.eth.getBalance(user3);
        console.log(user3_initial_balance);
        let user4_initial_balance = await web3.eth.getBalance(user4);
        console.log(user4_initial_balance);

        const airdrop_address = [user1, user2, user3, user4];
        tipbot.airDrop(airdrop_address,{from: admin1, value: web3.utils.toWei('2')});
        admin_initial_balance = await web3.eth.getBalance(admin1);
        user1_initial_balance = await web3.eth.getBalance(user1);
        user2_initial_balance = await web3.eth.getBalance(user2);
        user3_initial_balance = await web3.eth.getBalance(user3);
        user4_initial_balance = await web3.eth.getBalance(user4);
        console.log('admin: '  + await web3.utils.fromWei(admin_initial_balance));
        console.log('user1:' + await web3.utils.fromWei(user1_initial_balance));
        console.log('user2:' + await web3.utils.fromWei(user2_initial_balance));
        console.log('user3:' + await web3.utils.fromWei(user3_initial_balance));
        console.log('user4:' + await web3.utils.fromWei(user4_initial_balance));

        // TODO: 
        // truffleAssertions.eventEmitted(
        //     eventTip,
        //     "Tip",
        //     ({ from, toAddress, amount}) => 
        //         from === user1 &&
        //         toAddress === user2 &&
        //         amount.toNumber() === 1
        // );
    });

}); 
