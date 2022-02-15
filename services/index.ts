import { ChatService } from "./chat-service";
import { WalletService } from "./wallet-service";
import { GasEstimatorService } from "./gas-estimator-service";
import { TransactionService } from "./transaction-service";
import { BotMessageService } from "./bot-message-service";

export * from './web3'

export const walletService = new WalletService();
export const chatService = new ChatService();
export const gasEstimatorService = new GasEstimatorService();
export const transactionService = new TransactionService(gasEstimatorService);
export const botMessageService = new BotMessageService();

