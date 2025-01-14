import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { useOverviewContext } from "../providers/overviewCtx";
import { useAccount, useLocalStorage } from "@orderly.network/hooks";
import { useMemo } from "react";

export const usePerformanceScript = () => {
  const ctx = useOverviewContext();
  const [visible] = useLocalStorage("orderly_assets_visible", true);

  const { wrongNetwork } = useAppContext();
  const { state } = useAccount();
  const filteredData = useDataTap(ctx.data, {
    accountStatus:
      state.status === AccountStatusEnum.EnableTradingWithoutConnected
        ? AccountStatusEnum.EnableTradingWithoutConnected
        : AccountStatusEnum.EnableTrading,
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

  const _data = useMemo(() => {
    if (filteredData?.length ?? 0 > 0) return filteredData;
    return ctx.createFakeData(
      {
        account_value: 0,
        pnl: 0,
      },
      { account_value: 500, pnl: 500 }
    );
  }, [filteredData]);

  return {
    ...ctx,
    data: _data,
    invisible:
      wrongNetwork ||
      (state.status < AccountStatusEnum.EnableTrading &&
        state.status !== AccountStatusEnum.EnableTradingWithoutConnected),
    visible,
  };
};

export type UsePerformanceScriptReturn = ReturnType<
  typeof usePerformanceScript
>;
