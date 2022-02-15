import { rpcProvider } from "services/web3";
import { ethers } from "ethers";

export class GasEstimatorService {
  async getMaxAndPriorityFeeEstimate() {
    const httpsProvider = new ethers.providers.JsonRpcProvider(rpcProvider);
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await httpsProvider.getFeeData();

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
    };
  }
}
