import web3 from "services/web3";
import { TransactionConfig } from "web3-core";
import { GasEstimatorService } from "./gas-estimator-service";
import ContractJSON from "../solidity/build/contracts/TipBot.json";
import { AbiItem } from "web3-utils";
import { TipBotContract } from "./interfaces";

export class TransactionService {
  private contractAddress = process.env.CONTRACT_ADDRESS;
  constructor(private gasEstimatorService: GasEstimatorService) {}

  getContract() {
    const contractAddress = this.contractAddress;
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

  airDrop(addresses: string[]) {
    const contract: TipBotContract = this.getContract()!;
    return contract.methods.airDrop(addresses).encodeABI();
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
    data?: any,
    from?: string
  ): Promise<TransactionConfig> {
    const contractAddress = this.getContract()!.options.address;
    let gas = 21_000;
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await this.gasEstimatorService.getMaxAndPriorityFeeEstimate();

    if (!maxFeePerGas || !maxPriorityFeePerGas) {
      throw new Error("Unable to estimate gas fees.");
    }
    const nonce = from ? await web3.eth.getTransactionCount(from) : undefined;
    const accountNonce = nonce ? nonce + 1 : undefined;
    let transactionConfig: TransactionConfig = {
      nonce: accountNonce,
      from,
      to: contractAddress,
      value: web3.utils.toWei(amount.toString(), "ether"),
      maxFeePerGas: Number(maxFeePerGas),
      maxPriorityFeePerGas: Number(maxPriorityFeePerGas),
      data,
    };

    if (data) {
      gas = (await web3.eth.estimateGas(transactionConfig)) * 2;
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
