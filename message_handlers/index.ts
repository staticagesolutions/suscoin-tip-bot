import {
  chatService,
  walletService,
  transactionService,
  botMessageService,
} from "services";
import { CreateWalletMessageHandler } from "./create-wallet";
import { StartMessageHandler } from "./start";
import { TipMessageHandler } from "./tip";
import { SendMessageHandler } from "./send";
import { WalletInfoMessageHandler } from "./wallet_info";
import { HelpMessageHandler } from "./help";

export const messageHandlers = [
  new StartMessageHandler(chatService),
  new WalletInfoMessageHandler(walletService),
  new CreateWalletMessageHandler(walletService),
  new SendMessageHandler(walletService, transactionService, botMessageService),
  new TipMessageHandler(walletService, transactionService, botMessageService),
  new HelpMessageHandler(),
];
