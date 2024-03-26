import { FC } from "react";
import { TPSLEditor } from "@/block/tp_sl/tp_sl_editor";
import { Statistic } from "@/statistic";
import { useMarkPrice } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

import { Text } from "@/text/text";

export const TPSLSheet: FC<{
  position: API.Position;
  order?: API.AlgoOrder;
}> = (props) => {
  const { position, order } = props;
  const { data: markPrice } = useMarkPrice(position!.symbol);
  return (
    <div>
      <div className="orderly-py-3 orderly-space-x-2">
        {/* <span>BTC-PERP</span> */}
        <Text rule="symbol">{order!.symbol}</Text>
        {position.position_qty > 0 ? (
          <span className="orderly-text-trade-profit orderly-text-xs">
            Long
          </span>
        ) : (
          <span className="orderly-text-trade-loss orderly-text-xs">Short</span>
        )}
      </div>
      <div className="orderly-grid orderly-grid-cols-3 orderly-gap-2 orderly-pb-4">
        <Statistic
          label={"Order type"}
          value={"Position TP/SL"}
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
        />
        <Statistic
          label={"Avg. open"}
          value={position.average_open_price}
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
        />
        <Statistic
          label={"Mark price"}
          value={markPrice}
          rule="price"
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
        />
      </div>
      <TPSLEditor
        position={position}
        symbol={position.symbol}
        maxQty={position.position_qty}
        order={props.order}
      />
    </div>
  );
};
