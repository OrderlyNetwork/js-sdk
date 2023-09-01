import { LeverageView } from "@/block/leverage";
import { useFundingRate, useAccountInfo } from "@orderly.network/hooks";
import React, { FC } from "react";

interface Props {
  symbol: string;
}

export const MyLeverageView: FC<Props> = (props) => {
  const data = useFundingRate(props.symbol);
  const { data: info } = useAccountInfo();

  return (
    <div className="px-3 py-2">
      <LeverageView
        maxLeverage={info?.max_leverage ?? "-"}
        predFundingRate={data.est_funding_rate}
        countdown={data.countDown}
      />
    </div>
  );
};
