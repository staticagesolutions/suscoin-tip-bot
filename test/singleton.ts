import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from "@db";

jest.mock("../db/index", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeAll(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
