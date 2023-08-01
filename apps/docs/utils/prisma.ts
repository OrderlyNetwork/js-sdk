// @ts-ignore
import { env } from "./env";
import { PrismaClient } from "@prisma/client";

const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  prismaGlobal.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// if (env.NODE_ENV !== "production") {
//   prismaGlobal.prisma = prisma;
// }
