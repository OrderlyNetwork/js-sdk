import { LeverageView } from "@/block/leverage";
import { modal } from "@orderly.network/ui";
import {
  useFundingRate,
  useAccountInfo,
  useQuery,
} from "@orderly.network/hooks";
import React, { FC, memo, useCallback, useEffect, useMemo } from "react";

interface Props {
  symbol: string;
}

export const MyLeverageView: FC<Props> = (props) => {
  const data = useFundingRate(props.symbol);
  const { data: info } = useAccountInfo();
  const res = useQuery<any>(`/v1/public/info/${props.symbol}`, {
    focusThrottleInterval: 1000 * 60 * 60 * 24,
    dedupingInterval: 1000 * 60 * 60 * 24,
    revalidateOnFocus: false,
  });

  const maxAccountLeverage = info?.max_leverage;

  const maxSymbolLeverage = useMemo(() => {
    const base = res?.data?.base_imr;
    if (base) return 1 / base;
  }, [res]);

  const showLeverageInfo = useCallback(() => {
    modal.alert({
      title: "Max leverage",
      message: (
        <span
          id="orderly-max-leverage-content"
          className="orderly-text-3xs orderly-text-base-contrast-54"
        >
          This instrument supports up to {maxSymbolLeverage}x leverage. The
          actual amount cannot exceed the max account leverage.
        </span>
      ),
    });
  }, [maxSymbolLeverage]);

  const maxLeverage = useMemo(() => {
    if (!maxAccountLeverage || !maxSymbolLeverage) {
      return "-";
    }

    return Math.min(maxAccountLeverage, maxSymbolLeverage);
  }, [maxAccountLeverage, maxSymbolLeverage]);

  return (
    <div className="orderly-px-3 orderly-py-2">
      <LeverageView
        maxLeverage={maxLeverage as any}
        // @ts-ignore
        predFundingRate={data.est_funding_rate}
        countdown={data.countDown}
        onShowLeverageInfo={showLeverageInfo}
      />
    </div>
  );
};

export const MemoizedCompnent = memo(MyLeverageView);
