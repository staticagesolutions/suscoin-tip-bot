import { Account } from "web3-core";
import web3 from "./web3";

import db from "@db";

export class WalletService {
  constructor() {}

  public async getWallet(userId: number) {
    return db.wallet.findUnique({ where: { userId } });
  }

  public async checkIfExist(userId: number) {
    const wallet = await this.getWallet(userId);
    return Boolean(wallet);
  }

  public async saveWallet(userId: number, account: Account, username?: string) {
    const { address, privateKey } = account;
    await db.wallet.create({
      data: {
        address,
        privateKey,
        username,
        userId,
      },
    });
  }

  async getOrCreateWallet(userId: number, username?: string) {
    let wallet = await this.getWallet(userId);

    if (!wallet) {
      const recipientAccount = web3.eth.accounts.create();
      await this.saveWallet(userId, recipientAccount, username);
      wallet = await this.getWallet(userId);
    }

    return wallet;
  }
}
