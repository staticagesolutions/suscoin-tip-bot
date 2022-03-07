import db, { Wallet } from "@db";

const walletRepository = {
  deleteWalletByUserId: async (userId: bigint) =>
    await db.wallet.delete({
      where: {
        userId: userId,
      },
    }),
  getWalletByUserId: async (userId: bigint) =>
    db.wallet.findUnique({ where: { userId } }),
  saveWallet: async (wallet: Wallet) => {
    const { userId, address, privateKey, username } = wallet;
    return await db.wallet.create({
      data: {
        address,
        privateKey,
        username,
        userId,
      },
    });
  },
  getWalletByAddress: async (address: string) =>
    db.wallet.findFirst({
      where: {
        address,
      },
    }),
};

export default walletRepository;
