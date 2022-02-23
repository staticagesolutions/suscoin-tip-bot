import { BalanceCallbackHandler } from "./balance";
import { ConfirmTransactionCallbackHandler } from "./confirm-transaction";
import * as callbackUtils from "./utils";
import {
  activeAirdropService,
  botMessageService,
  walletService,
} from "services";
import { PrivateKeyCallbackHandler } from "./private-key";
import { JoinAirdropCallbackHandler } from "./join-airdrop";
import { CloseAirdropCallbackHandler } from "./close-airdrop";
import { ActiveAirdropCallbackHandler } from "./confirm-active-airdrop";

const confirmTransactionCallBackHandler = new ConfirmTransactionCallbackHandler(
  walletService
);
const balanceCallbackHandler = new BalanceCallbackHandler(walletService);
const privateKeyCallbackHandler = new PrivateKeyCallbackHandler(walletService);
const activeAirdropCallbackHandler = new JoinAirdropCallbackHandler(
  botMessageService,
  activeAirdropService
);
const closeAirdropCallbackHandler = new CloseAirdropCallbackHandler();
const confirmAirdropCallbackHandler = new ActiveAirdropCallbackHandler(
  walletService,
  activeAirdropService
);
export const callbackHandlers = [
  confirmAirdropCallbackHandler,
  confirmTransactionCallBackHandler,
  balanceCallbackHandler,
  privateKeyCallbackHandler,
  activeAirdropCallbackHandler,
  closeAirdropCallbackHandler,
];
export { callbackUtils };
