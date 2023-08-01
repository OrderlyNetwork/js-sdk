import { publicProcedure, router } from "@/server/trpc";
import { z } from "zod";
import { prisma } from "@/utils/prisma";

export const themeRouter = router({
  byBroker: publicProcedure
    .input(
      z.object({
        id: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.theme.findMany({
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
      });
    }),

  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.theme.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  add: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        brokerId: z.string(),
        colors: z.any(),
        palette: z.any(),
        typography: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      console.log(input);
      const theme = await prisma.theme.create({
        data: {
          name: input.name,
          description: input.description,
          version: 1,
          broker: {
            connect: {
              id: input.brokerId,
            },
          },
        },
      });
      // return {};
      return theme;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        // palette: jsonSchema.optional(),
        palette: z.any(),
        colors: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      console.log(input);
      const theme = await prisma.theme.update({
        where: {
          id: input.id,
        },
        data: {
          palette: input.palette,
        },
      });
      return theme;
    }),
  updateColors: publicProcedure
    .input(
      z.object({
        id: z.string(),
        colors: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      console.log(input);
      const theme = await prisma.theme.update({
        where: {
          id: input.id,
        },
        data: {
          colors: input.colors,
        },
      });
      return theme;
    }),
  updatePalette: publicProcedure
    .input(
      z.object({
        id: z.string(),
        palette: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      console.log(input);
      const theme = await prisma.theme.update({
        where: {
          id: input.id,
        },
        data: {
          palette: input.palette,
          updatedAt: new Date(),
        },
      });
      return theme;
    }),
});

export type DesignRouter = typeof themeRouter;
