import web3 from "services/web3";
import { TransactionConfig } from "web3-core";
import { GasEstimatorService } from "./gas-estimator-service";

export class TransactionService {
  constructor(private gasEstimatorService: GasEstimatorService) {}


  async validateSufficientBalance(address:string, amount: number){
    const balance = await web3.eth.getBalance(address);
    return Number(web3.utils.fromWei(balance, 'ether')) > amount;
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
