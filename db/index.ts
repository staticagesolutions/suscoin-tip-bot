import { PrismaClient } from "@prisma/client";
import { createPrismaQueryEventHandler } from "prisma-query-log";

export * from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    errorFormat: "minimal",
  });
} else {
  prisma = new PrismaClient({
    errorFormat: "pretty",
    log: [
      {
        level: "query",
        emit: "event",
      },
    ],
  });
  const log = createPrismaQueryEventHandler();
  prisma.$on("query" as any, log as any)
}

export default prisma;
