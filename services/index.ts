import { ChatService } from "./chat-service";
import { WalletService } from "./wallet-service";

export * from './web3'

export const walletService = new WalletService();
export const chatService = new ChatService()


