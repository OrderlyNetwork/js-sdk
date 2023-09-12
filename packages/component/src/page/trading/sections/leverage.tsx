import { LeverageView } from "@/block/leverage";
import { modal } from "@/modal";
import { useFundingRate, useAccountInfo } from "@orderly.network/hooks";
import React, { FC, useCallback } from "react";

interface Props {
  symbol: string;
}

export const MyLeverageView: FC<Props> = (props) => {
  const data = useFundingRate(props.symbol);
  const { data: info } = useAccountInfo();

  const showLeverageInfo = useCallback(() => {
    modal.alert({
      title: "Max leverage",
      message: (
        <span className="text-sm text-base-contrast/60">
          This instrument supports up to 50x leverage. The actual amount cannot
          exceed the max account leverage.
        </span>
      ),
    });
  }, []);

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
