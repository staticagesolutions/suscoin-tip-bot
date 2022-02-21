import { BalanceCallbackHandler } from "./balance";
import { ConfirmTransactionCallbackHandler } from "./confirm-transaction";
import * as callbackUtils from "./utils";
import { walletService } from "services";

const confirmTransactionCallBackHandler =
  new ConfirmTransactionCallbackHandler(walletService);
const balanceCallbackHandler = new BalanceCallbackHandler(walletService);

export const callbackHandlers = [
  confirmTransactionCallBackHandler,
  balanceCallbackHandler,
];
export { callbackUtils };
