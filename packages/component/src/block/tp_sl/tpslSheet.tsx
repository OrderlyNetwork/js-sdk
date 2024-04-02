import { FC } from "react";
import { TPSLEditor } from "@/block/tp_sl/tp_sl_editor";
import { Statistic } from "@/statistic";
import { useMarkPrice } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

import { Text } from "@/text/text";
import { AlgoOrderRootType } from "@orderly.network/types";
import { useModal } from "@/modal";
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

  const onTypeChange = (type: AlgoOrderRootType) => {
    // console.log(type);
    setStates({ type });
  };

  return (
    <div>
      <div className="orderly-py-3 orderly-space-x-2">
        <Text rule="symbol">{position!.symbol}</Text>
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
            order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
              ? "Position TP/SL"
              : "TP/SL"
          }
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
      />
    </div>
  );
};
