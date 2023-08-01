import { publicProcedure, router } from "@/server/trpc";
import z from "zod";
import { prisma } from "@/utils/prisma";

export const brokerRouter = router({
  list: publicProcedure.query(async () => {
    const brokers = await prisma.broker.findMany();

    return brokers;
  }),
  add: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const broker = await prisma.broker.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });

      return broker;
    }),
});
