import web3 from "services/web3";
import { TransactionConfig } from "web3-core";
import { GasEstimatorService } from "./gas-estimator-service";
import ContractJSON from "../solidity/build/contracts/TipBot.json";
import { AbiItem } from "web3-utils";
import { TipBotContract } from "./interfaces";

export class TransactionService {
  constructor(private gasEstimatorService: GasEstimatorService) {}

  getContract() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("SMART CONTRACT ADDRESS is undefined");
    }
    let contract;
    if (web3.utils.isAddress(contractAddress)) {
      contract = new web3.eth.Contract(
        ContractJSON.abi as AbiItem[],
        contractAddress
      );
    }
    return contract;
  }

  tipByContract(recipientAddress: string) {
    const contract: TipBotContract = this.getContract()!;
    return contract.methods.tip(recipientAddress).encodeABI();
  }

  async validateSufficientBalance(address: string, amount: number) {
    const balance = await web3.eth.getBalance(address);
    return Number(web3.utils.fromWei(balance, "ether")) > amount;
  }

  async getTransactionConfigForContract(
    amount: number,
    data?: any
  ): Promise<TransactionConfig> {
    const contractAddress = this.getContract()!.options.address;
    console.log(contractAddress);
    let gas = 21000;
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await this.gasEstimatorService.getMaxAndPriorityFeeEstimate();

    if (!maxFeePerGas || !maxPriorityFeePerGas) {
      throw new Error("Unable to estimate gas fees.");
    }
    let transactionConfig: TransactionConfig = {
      to: contractAddress,
      value: web3.utils.toWei(amount.toString(), "ether"),
      maxFeePerGas: Number(maxFeePerGas),
      maxPriorityFeePerGas: Number(maxPriorityFeePerGas),
      data,
    };

    if (data) {
      gas = await web3.eth.estimateGas(transactionConfig);
    }

    return {
      ...transactionConfig,
      gas,
    };
  }

  async getTransactionConfig(toAddress: string, amount: number) {
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await this.gasEstimatorService.getMaxAndPriorityFeeEstimate();

    if (!maxFeePerGas || !maxPriorityFeePerGas) {
      throw new Error("Unable to estimate gas fees.");
    }

    const transactionConfig: TransactionConfig = {
      to: toAddress,
      value: web3.utils.toWei(amount.toString(), "ether"),
      maxFeePerGas: Number(maxFeePerGas),
      maxPriorityFeePerGas: Number(maxPriorityFeePerGas),
      gas: 21000,
    };

    return transactionConfig;
  }

  async signTransaction(
    privateKey: string,
    transactionConfig: TransactionConfig
  ) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const signedTransaction = await account.signTransaction(transactionConfig);

    return signedTransaction;
  }

  sendTransaction(rawTransaction: string) {
    return web3.eth.sendSignedTransaction(rawTransaction);
  }
}
