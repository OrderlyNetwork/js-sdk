import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { useOverviewContext } from "../providers/overviewCtx";

export const usePerformanceScript = () => {
  const ctx = useOverviewContext();

  const { wrongNetwork } = useAppContext();
  // const { state } = useAccount();
  const filteredData = useDataTap(ctx.data, {
    accountStatus: AccountStatusEnum.EnableTrading,
    fallbackData: ctx.createFakeData(
      {
        account_value: 0,
        pnl: 0,
      },
      { account_value: 500, pnl: 500 }
    ),
    // fallbackData:
    //   ctx.data && ctx.data.length >= 2
    //     ? [ctx.data[0], ctx.data[ctx.data.length - 1]]
    //     : ctx.createFakeData(
    //         {
    //           account_value: 0,
    //           pnl: 0,
    //         },
    //         { account_value: 1000, pnl: 1000 }
    //       ),
  });

  return {
    ...ctx,
    data: filteredData,
    invisible: wrongNetwork || !ctx.data.length,
  };
};

export type UsePerformanceScriptReturn = ReturnType<
  typeof usePerformanceScript
>;
