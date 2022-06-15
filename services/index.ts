import { ChatService } from "./chat-service";
import { WalletService } from "./wallet-service";
import { GasEstimatorService } from "./gas-estimator-service";
import { TransactionService } from "./transaction-service";
import { BotMessageService } from "./bot-message-service";
import { GroupMemberService } from "./group-member-service";
import { ActiveAirdropService } from "./active-airdrop-service";
import { AirdropMemberService } from "./airdrop-member-service";
import { GroupChatService } from "./group-chat-service";
import { SupportedTokenService } from "./supported-token-service";

export * from "./web3";

export const walletService = new WalletService();
export const chatService = new ChatService();
export const gasEstimatorService = new GasEstimatorService();
export const supportedTokenService = new SupportedTokenService();
export const transactionService = new TransactionService(gasEstimatorService);
export const botMessageService = new BotMessageService();
export const groupMemberService = new GroupMemberService();
export const groupChatService = new GroupChatService();
export const activeAirdropService = new ActiveAirdropService();
export const airdropMemberService = new AirdropMemberService();
