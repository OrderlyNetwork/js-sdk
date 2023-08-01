import { appRouter } from "@/server/routers/_app";
import type { NextRequest } from "next/server";
import { createNextApiHandler } from "@trpc/server/adapters/next";

export default createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
