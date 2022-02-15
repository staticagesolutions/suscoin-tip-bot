import Web3 from "web3";

export const rpcProvider = process.env.RPC_PROVIDER ?? "https://rpc.syscoin.org";
const web3 = new Web3(rpcProvider);

export default web3;
