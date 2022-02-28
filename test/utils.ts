import { PrismaPromise } from "@prisma/client";
import db from "@db";

export async function resetData() {
  const dbName = process.env.DB_TEST_NAME;
  if (!dbName) {
    throw new Error(
      "DB_TEST_NAME is not defined. Make sure to run test only in dev environment"
    );
  }
  const transactions: PrismaPromise<any>[] = [];
  transactions.push(db.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`);

  const tablenames = await db.$queryRaw<
    Array<{ TABLE_NAME: string }>
  >`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = ${dbName};`;
  for (const { TABLE_NAME } of tablenames) {
    const tablename = TABLE_NAME;
    if (
      tablename !== "_prisma_migrations" &&
      tablename !== "Wallet" &&
      tablename !== "Chat"
    ) {
      try {
        transactions.push(db.$executeRawUnsafe(`TRUNCATE ${tablename};`));
      } catch (error) {
        console.log({ error });
      }
    }
  }

  transactions.push(db.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);

  try {
    await db.$transaction(transactions);
  } catch (error) {
    console.log({ error });
  }
}
