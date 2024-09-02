import { FC, useState } from "react";
import { TPSLEditor } from "@/block/tp_sl/tp_sl_editor";
import { Statistic } from "@/statistic";
import { useMarkPrice, useSymbolsInfo } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

import { Text } from "@/text/text";
import { AlgoOrderRootType } from "@orderly.network/types";
import { useModal } from "@orderly.network/ui";
import { Divider } from "@/divider";

export const TPSLOrderEditorSheet: FC<{
  position: API.Position;
  order?: API.AlgoOrder;
  isEditing?: boolean;
  canModifyQty?: boolean;
  onClose?: () => void;
}> = (props) => {
  const { position, order, isEditing } = props;
  const { data: markPrice } = useMarkPrice(position!.symbol);
  const { hide, setStates } = useModal();
  const priceDp = useSymbolsInfo()[position!.symbol]("quote_dp") || 2;
  const [type, setType] = useState(order?.algo_type);

  const onTypeChange = (type: AlgoOrderRootType) => {
    // console.log(type);
    setStates({ type });
    setType(type);
  };

  return (
    <div>
      <div className="orderly-py-3 orderly-space-x-2">
        <Text rule="symbol" className="orderly-text-xs">
          {position!.symbol}
        </Text>
        {isEditing ? null : (
          <>
            {position.position_qty > 0 ? (
              <span className="orderly-text-trade-profit orderly-text-xs">
                Long
              </span>
            ) : (
              <span className="orderly-text-trade-loss orderly-text-xs">
                Short
              </span>
            )}
          </>
        )}
      </div>
      <div className="orderly-grid orderly-grid-cols-3 orderly-gap-2 orderly-pb-4">
        <Statistic
          label={"Order type"}
          value={
            type === AlgoOrderRootType.POSITIONAL_TP_SL
              ? "Position TP/SL"
              : "TP/SL"
          }
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
        />
        <Statistic
          label={"Avg. open"}
          value={position.average_open_price}
          rule="price"
          precision={priceDp}
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
        />
        <Statistic
          label={"Mark price"}
          value={markPrice}
          precision={priceDp}
          rule="price"
          align="right"
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-xs"
        />
      </div>
      {!props.canModifyQty && <Divider className="orderly-mb-3" />}
      <TPSLEditor
        position={position}
        symbol={position.symbol}
        maxQty={position.position_qty}
        order={props.order}
        isEditing={props.isEditing}
        canModifyQty={props.canModifyQty}
        onCancel={hide}
        onSuccess={hide}
        onTypeChange={onTypeChange}
        quoteDp={priceDp}
      />
    </div>
  );
};
