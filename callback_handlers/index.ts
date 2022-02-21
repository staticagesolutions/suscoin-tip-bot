import { BalanceCallbackHandler } from "./balance";
import { ConfirmTransactionCallbackHandler } from "./confirm-transaction";
import * as callbackUtils from "./utils";
import { walletService } from "services";
import { PrivateKeyCallbackHandler } from "./private-key";

const confirmTransactionCallBackHandler =
  new ConfirmTransactionCallbackHandler();
const balanceCallbackHandler = new BalanceCallbackHandler(walletService);
const privateKeyCallbackHandler = new PrivateKeyCallbackHandler(walletService);

export const callbackHandlers = [
  confirmTransactionCallBackHandler,
  balanceCallbackHandler,
  privateKeyCallbackHandler
];
export { callbackUtils };
