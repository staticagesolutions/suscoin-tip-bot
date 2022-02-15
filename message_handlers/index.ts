import {
  chatService,
  walletService,
  transactionService,
  botMessageService,
} from "services";
import { BalanceMessageHandler } from "./balance";
import { CreateWalletMessageHandler } from "./create-wallet";
import { StartMessageHandler } from "./start";
import { TipMessageHandler } from "./tip";
import { TransferMessageHandler } from "./transfer";
import { WalletInfoMessageHandler } from "./wallet_info";

export const messageHandlers = [
  new StartMessageHandler(chatService),
  new WalletInfoMessageHandler(walletService),
  new CreateWalletMessageHandler(walletService),
  new BalanceMessageHandler(walletService),
  new TransferMessageHandler(walletService),
  new TipMessageHandler(walletService, transactionService, botMessageService),
];
