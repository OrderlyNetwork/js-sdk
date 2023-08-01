import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@/server/routers/_app";

export const trpc = createTRPCReact<AppRouter>({
  // overrides: {
  //   useMutation: {
  //     async onSuccess(opts) {
  //       await opts.originalFn();
  //       await opts.queryClient.invalidateQueries();
  //     },
  //   },
  // },
});
