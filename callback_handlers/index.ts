import { ConfirmTransactionCallbackHandler } from "./confirm-transaction";
import * as callbackUtils from "./utils";

const confirmTransactionCallBackHandler =
  new ConfirmTransactionCallbackHandler();

export const callbackHandlers = [confirmTransactionCallBackHandler];
export { callbackUtils };
