import { LeverageView } from "@/block/leverage";
import { modal } from "@/modal";
import {
  useFundingRate,
  useAccountInfo,
  useQuery,
} from "@orderly.network/hooks";
import React, { FC, useCallback, useEffect, useMemo } from "react";

interface Props {
  symbol: string;
}

export const MyLeverageView: FC<Props> = (props) => {
  const data = useFundingRate(props.symbol);
  const { data: info } = useAccountInfo();
  const res = useQuery<any>(`/v1/public/info/${props.symbol}`);

  const leverage = useMemo(() => {
    const base = res?.data?.base_imr;
    if (base) return 1 / base;
    return 50;
  }, [res]);

  const showLeverageInfo = useCallback(() => {
    modal.alert({
      title: "Max leverage",
      message: (
        <span className="text-3xs text-base-contrast-54">
          This instrument supports up to {leverage}x leverage. The actual amount
          cannot exceed the max account leverage.
        </span>
      ),
    });
  }, [leverage]);

  return (
    <div className="px-3 py-2">
      <LeverageView
        maxLeverage={info?.max_leverage ?? "-"}
        predFundingRate={data.est_funding_rate}
        countdown={data.countDown}
        onShowLeverageInfo={showLeverageInfo}
      />
    </div>
  );
};
