import { BalanceCallbackHandler } from "./balance";
import { ConfirmTransactionCallbackHandler } from "./confirm-transaction";
import * as callbackUtils from "./utils";
import {
  activeAirdropService,
  airdropMemberService,
  botMessageService,
  walletService,
} from "services";
import { PrivateKeyCallbackHandler } from "./private-key";
import { JoinAirdropCallbackHandler } from "./join-airdrop";
import { CloseAirdropCallbackHandler } from "./close-airdrop";
import { ActiveAirdropCallbackHandler } from "./confirm-active-airdrop";
import { DeleteWalletCallbackHandler } from "./delete-wallet";

const confirmTransactionCallBackHandler = new ConfirmTransactionCallbackHandler(
  walletService
);
const balanceCallbackHandler = new BalanceCallbackHandler(walletService);
const privateKeyCallbackHandler = new PrivateKeyCallbackHandler(walletService);
const activeAirdropCallbackHandler = new JoinAirdropCallbackHandler(
  botMessageService,
  activeAirdropService,
  airdropMemberService
);
const closeAirdropCallbackHandler = new CloseAirdropCallbackHandler();
const confirmAirdropCallbackHandler = new ActiveAirdropCallbackHandler(
  walletService,
  activeAirdropService
);

const deleteWalletCallbackHandler = new DeleteWalletCallbackHandler(
  walletService
);
export const callbackHandlers = [
  confirmAirdropCallbackHandler,
  confirmTransactionCallBackHandler,
  balanceCallbackHandler,
  privateKeyCallbackHandler,
  activeAirdropCallbackHandler,
  closeAirdropCallbackHandler,
  deleteWalletCallbackHandler,
];
export { callbackUtils };
