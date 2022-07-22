# Suscoin Tip Bot

## Requirements
### Create Wallet `/create_wallet`
    - Generates address, privatekey and associate with username
### Wallet Info `/wallet_info`
    - Fetches balance using Web3
    - Return user’s wallet address
### Tip  `/tip @alexpguerra 10`
    - Retrieve @alexpguerra’s wallet address (if registered)
    - Execute `tip(address)` function of JagBot smart contract
        - Deducts fee
        - transfers remaining amount to address
    - Send telegram message: “Transaction is success: <transaction-hash>”
### Airdrop `/airdop sys-community 10 1000’
    - Randomly pick 10 member of telegram group `sys-community`
    - Retrieve address for all 10 members
    - Execute `airdrop(addresses: [])`
        - Deducts fee
        - Divide and transfers remaining amount to all addresses
        - Notify on Group: “Congratulation <personX>! You have received airdrop of <amount> <token> from <sender>”.
        - Send transaction hash to “Sender”
### Airdrop Active `/airdrop active sys-community 1000”
    - Retrieve currently active members of `sys-community`
    - Filter who are registered to JagBot
    - Retrieve address associated
    - Execute `airdrop(address: [])`
### Withdraw `/withdraw   <amount> <address>`
    - Execute native blockchain `transfer` function to specified address.
    - No fees.

## Serverless NextJS API via Webhook
    - `/start` message handler
    - `/balance` message handler
    - `/withdraw <address> <amount>` message handler CONFIRM SIGNING Process + Notification to Sender
    - `/tip <@telegramUser> <amount>`   — CONFIRM SIGNING Process + Notification to Recipient and Sender
    - `/airdop-active sys-community 1000`.   — CONFIRM SIGNING Process + Notification to Recipient and Sender
    - `/airdop sys-community 1000`.  — CONFIRM SIGNING Process + Notification to Recipient and Sender
    - `/create_wallet`
    - `/delete_wallet`

## Smart Contract
    - `tip(address to)`
    - `airdrop(address []accounts)`
    - `setFeeRate(uint256 rate, bytes32[] signatures)`     100000 
    - `withdraw(uint256 amount, bytes32[] signatures)`
    - `grantAdminRole(address account, bytes32[] signatures)`
    - `revokeAdminRole(address account, bytes32[] signatures)`
    - `isAdmin(address account)`

## Technologies:
1. NextJS
2. Planetscale - DB
3. Web3JS
4. Prisma ORM
5. React - for landing page
6. Solidity
7. Truffle
