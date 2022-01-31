import { Account } from "web3-core";

import db from "@db";

export class WalletService {
  constructor() {}

  public async getWallet(username: string) {
      return db.wallet.findUnique({ where: { username } });
  }

  public async checkIfExist(username: string) {
    const wallet = await this.getWallet(username);
    return Boolean(wallet);
  }

  public async saveWallet(username: string, account: Account) {
    const { address, privateKey } = account;
    await db.wallet.create({
      data: {
        address,
        privateKey,
        username,
      },
    });
  }
}
