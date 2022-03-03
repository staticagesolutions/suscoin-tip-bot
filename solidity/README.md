# Smart Contract


## Kodigo

```javascript
const tipbot = await TipBot.deployed();
contract.function_name();
web3.eth.getBalance('account address');
tipbot.grantRole(web3.utils.fromAscii("DEFAULT_ADMIN_ROLE"), '0xF7B403a18eAA5A59c634B85C2e7aA6c7932d71F2');


tipbot.tip('0x65d5cCa3795d1eC1d0e22Fd5EE540eF2615827BB', {value: 1200})

var balance = await web3.eth.getBalance('0x65d5cCa3795d1eC1d0e22Fd5EE540eF2615827BB')
web3.utils.fromWei(balance, '')

tipbot.tip(admin1,{from: user2, value: 11000000000000000000});

```


```javascript

const tipbot = await TipBot.deployed();

const [admin1, admin2, user1, user2] = accounts;
await web3.eth.getBalance(admin1);
await web3.eth.getBalance(admin2);
await web3.eth.getBalance(user1);
await web3.eth.getBalance(user2);

const bal_admin1 = await web3.eth.getBalance(admin1);
const bal_admin2 = await web3.eth.getBalance(admin2);
const bal_user1 = await web3.eth.getBalance(user1);
const bal_user2 = await web3.eth.getBalance(user2);

web3.eth.getBalance(admin1).then( ( balance ) => web3.utils.fromWei(balance)).then(console.log);


//Correct format
tipbot.tip(admin2,{from: admin1, value: web3.utils.toWei('.100')});
tipbot.tip(admin2,{from: admin1, value: 1000000000000000000});

//Correct format airDrop([ admin1, admin2, admin3], {value: 1}); 
tipbot.airDrop([admin2, user1, user2], {value: web3.utils.toWei('0.1234')});

const encoded = web3.eth.abi.encodeParameter('uint256','amount');
const hashed = web3.util.sha3(encoded);
const signatures = [ 
    admin1.sign(hashed).signature, 
    admin2.sign(hashed).signature
];

await web3.eth.abi.encodeParameter('uint256',web3.utils.toWei('0.234'));
```


## MaticTestNet

```javascript
const tipbot = await TipBot.deployed();
const [admin1, admin2, user1, user2] = accounts;
tipbot.grantRole(web3.utils.fromAscii("DEFAULT_ADMIN_ROLE"), admin1);
tipbot.grantRole(web3.utils.fromAscii("DEFAULT_ADMIN_ROLE"), admin2);

tipbot.tip(user1,{from: user2, value: web3.utils.toWei('.0001')});

web3.eth.sendTransaction({to:accounts[0], from:accounts[1], value: web3.utils.toWei('1')})




```
const jsonAbiNew2 = fs.readFileSync(path.resolve("./build/contracts/TipBot.json"));
const tipbot3 = new web3.eth.Contract(JSON.parse(jsonAbiNew3).abi, "0x74A614Bd4D07da4f2cd790E8671A0717775B16dB")
