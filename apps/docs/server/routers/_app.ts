import { mergeRouters, publicProcedure, router } from "@/server/trpc";
import { themeRouter } from "@/server/routers/theme";
import { brokerRouter } from "@/server/routers/broker";

export const appRouter = router({
  theme: themeRouter,
  broker: brokerRouter,
  health: publicProcedure.query(() => "ok"),
});

// export const appRouter = mergeRouters(designRouter, healthRouter);

export type AppRouter = typeof appRouter;
