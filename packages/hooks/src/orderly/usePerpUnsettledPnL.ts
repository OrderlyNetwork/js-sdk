import { useAppStore } from "./appStore";

/** Internal funding PnL; public useCollateral continues to expose full equity PnL. */
export const usePerpUnsettledPnL = () =>
  useAppStore((state) => state.portfolio.perpUnsettledPnL ?? 0);
